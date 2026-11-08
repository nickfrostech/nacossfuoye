/**
 * NACOSS FUOYE Portal - Form Submissions Router, Data API & 1-Click Email Approval
 * 
 * 1. POST: Receives form submissions from the portal into Google Sheets:
 *    - "SoftwareRequests" (includes Student Email)
 *    - "ProductShowcase" (includes Student Email, Status = "Pending")
 *    - "BuildLabSubmission" (includes Student Email, Status = "Under Review")
 * 
 * 2. EMAIL NOTIFICATIONS:
 *    - Notifies President, Vice President, and Software Director with full details.
 *    - Product Showcase emails include 1-Click [Approve] and [Reject] buttons.
 * 
 * 3. 1-CLICK DECISION & AUTO-REPLY TO STUDENTS:
 *    - When an executive approves or rejects, Google Apps Script sets the row status
 *      AND automatically dispatches a notification email to the student!
 * 
 * 4. GET: Serves data to the frontend:
 *    - ?sheet=Events          -> Returns events JSON.
 *    - ?sheet=Hackathons      -> Returns hackathons JSON.
 *    - ?sheet=ProductShowcase -> Returns approved student projects.
 */

// =============================================================================
// 1. CONFIGURATION
// =============================================================================
const NOTIFICATION_EMAILS = [
   'nb.nicholasbenson@gmail.com',      // President email address
   'kolawolegoodnews1@gmail.com',     // Vice President's email address
   'caleborabe78@gmail.com',          // Software Director's email address
];

// Retrieve approval secret securely from Google Apps Script Script Properties
// To set this, go to: Apps Script Project Settings -> Script Properties -> Add 'APPROVAL_SECRET'
// Or run the setupApprovalSecret() helper function below once in the Apps Script editor.
function getApprovalSecret() {
   return PropertiesService.getScriptProperties().getProperty('APPROVAL_SECRET') || '';
}

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// Configuration for each submission type
const SHEET_MAP = {
   software_request: {
      sheetName: 'SoftwareRequests',
      label: 'Software Request',
      badgeColor: '#059669', // Emerald
      mapRow: (data) => [
         data.timestamp || new Date().toISOString(),
         data.fullName || '',
         data.email || '',
         data.matricNo || '',
         data.level || '',
         data.softwareName || '',
         data.courseCode || '',
         data.os || '',
         data.deliveryMethod || '',
         data.phone || '',
         data.notes || '',
         'Pending', // Col 12: Status
      ],
      getFields: (data) => [
         { label: 'Full Name', value: data.fullName },
         { label: 'Student Email', value: data.email, isEmail: true },
         { label: 'Matric Number', value: data.matricNo },
         { label: 'Academic Level', value: data.level },
         { label: 'Software Name', value: data.softwareName },
         { label: 'Course Code', value: data.courseCode },
         { label: 'Operating System', value: data.os },
         { label: 'Delivery Method', value: data.deliveryMethod },
         { label: 'Phone / WhatsApp', value: data.phone, isPhone: true },
         { label: 'Notes / Extra Info', value: data.notes },
      ],
   },
   product_showcase: {
      sheetName: 'ProductShowcase',
      label: 'Product Showcase Submission',
      badgeColor: '#2563eb', // Blue
      mapRow: (data) => [
         data.timestamp || new Date().toISOString(),
         data.fullName || '',
         data.email || '',
         data.level || '',
         data.title || '',
         data.demoUrl || '',
         data.githubUrl || '',
         data.phone || '',
         data.desc || '',
         'Pending', // Col 10: Status (Pending, Approved, Rejected)
      ],
      getFields: (data) => [
         { label: 'Full Name', value: data.fullName },
         { label: 'Student Email', value: data.email, isEmail: true },
         { label: 'Academic Level', value: data.level },
         { label: 'Project / Product Title', value: data.title },
         { label: 'Live Demo URL', value: data.demoUrl, isLink: true },
         { label: 'GitHub Repository', value: data.githubUrl, isLink: true },
         { label: 'Phone / WhatsApp', value: data.phone, isPhone: true },
         { label: 'Project Description', value: data.desc },
      ],
   },
   buildlab_submission: {
      sheetName: 'BuildLabSubmission',
      label: 'BuildLab Idea Submission',
      badgeColor: '#7c3aed', // Purple
      mapRow: (data) => [
         data.timestamp || new Date().toISOString(),
         data.fullName || '',
         data.email || '',
         data.level || '',
         data.title || '',
         data.phone || '',
         data.desc || '',
         'Under Review', // Col 8: Status
      ],
      getFields: (data) => [
         { label: 'Full Name', value: data.fullName },
         { label: 'Student Email', value: data.email, isEmail: true },
         { label: 'Academic Level', value: data.level },
         { label: 'Idea / Project Title', value: data.title },
         { label: 'Phone / WhatsApp', value: data.phone, isPhone: true },
         { label: 'Concept Description', value: data.desc },
      ],
   },
};

// =============================================================================
// 2. HTTP POST HANDLER (Called from Website forms)
// =============================================================================
function doPost(e) {
   try {
      let data;
      if (e.postData && e.postData.contents) {
         data = JSON.parse(e.postData.contents);
      } else if (e.parameter) {
         data = e.parameter;
      } else {
         throw new Error('No post data received');
      }

      const type = data.type;
      const config = SHEET_MAP[type];

      if (!config) {
         return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Unknown submission type: ' + type })
         ).setMimeType(ContentService.MimeType.JSON);
      }

      let sheet = SPREADSHEET.getSheetByName(config.sheetName);
      if (!sheet) {
         // Auto-create sheet if it does not exist yet with headers
         sheet = SPREADSHEET.insertSheet(config.sheetName);
         if (type === 'software_request') {
            sheet.appendRow(['Timestamp', 'Full Name', 'Student Email', 'Matric No', 'Level', 'Software Name', 'Course Code', 'OS', 'Delivery Method', 'Phone', 'Notes', 'Status']);
         } else if (type === 'product_showcase') {
            sheet.appendRow(['Timestamp', 'Full Name', 'Student Email', 'Level', 'Project Title', 'Demo URL', 'GitHub URL', 'Phone', 'Description', 'Status']);
         } else if (type === 'buildlab_submission') {
            sheet.appendRow(['Timestamp', 'Full Name', 'Student Email', 'Level', 'Project Title', 'Phone', 'Description', 'Status']);
         }
      }

      // Append row to Google Sheet
      const row = config.mapRow(data);
      sheet.appendRow(row);
      const rowIndex = sheet.getLastRow();

      // Send email notification with 1-click approval buttons to Executives
      let emailSent = false;
      let emailError = null;
      try {
         sendSubmissionNotification(config, data, type, rowIndex);
         emailSent = true;
      } catch (err) {
         emailError = err.toString();
         console.error('Failed to send notification email:', err);
      }

      return ContentService.createTextOutput(
         JSON.stringify({
            status: 'success',
            sheet: config.sheetName,
            rowIndex: rowIndex,
            emailNotificationSent: emailSent,
            emailError: emailError
         })
      ).setMimeType(ContentService.MimeType.JSON);

   } catch (err) {
      console.error('doPost error:', err);
      return ContentService.createTextOutput(
         JSON.stringify({ status: 'error', message: err.toString() })
      ).setMimeType(ContentService.MimeType.JSON);
   }
}

// =============================================================================
// 3. HTTP GET HANDLER (1-Click Approvals & Reading Data for Frontend)
// =============================================================================
function doGet(e) {
   try {
      const params = (e && e.parameter) ? e.parameter : {};

      // ----------------------------------------------------------------------
      // A. 1-CLICK EMAIL APPROVAL / REJECTION HANDLER (With Student Auto-Reply)
      // ----------------------------------------------------------------------
      if (params.action === 'approve' || params.action === 'reject') {
         const expectedSecret = getApprovalSecret();
         if (!expectedSecret || params.key !== expectedSecret) {
            return HtmlService.createHtmlOutput(renderStatusCard(
               'Unauthorized Request',
               'The approval key provided is invalid, expired, or unconfigured in Script Properties.',
               '#ef4444',
               false
            ));
         }

         const sheetName = params.type === 'product_showcase' ? 'ProductShowcase' : (params.sheet || 'ProductShowcase');
         const sheet = SPREADSHEET.getSheetByName(sheetName);
         if (!sheet) {
            return HtmlService.createHtmlOutput(renderStatusCard('Sheet Not Found', `Sheet "${sheetName}" does not exist in your spreadsheet.`, '#ef4444', false));
         }

         const lastRow = sheet.getLastRow();
         if (lastRow < 2) {
            return HtmlService.createHtmlOutput(renderStatusCard(
               'No Submissions Yet',
               `Sheet "${sheetName}" is currently empty. A student submission must be recorded before an executive can approve or reject it.`,
               '#f59e0b',
               false
            ));
         }

         const rowIndex = parseInt(params.row, 10);
         if (isNaN(rowIndex) || rowIndex <= 1 || rowIndex > lastRow) {
            return HtmlService.createHtmlOutput(renderStatusCard(
               'Row Not Found',
               `Row #${params.row} does not exist in "${sheetName}". The sheet currently contains ${lastRow} row(s).`,
               '#ef4444',
               false
            ));
         }

         // Read row data dynamically using column headers with positional fallbacks
         const lastCol = Math.max(sheet.getLastColumn(), 10);
         const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0] || [];
         const rowData = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0] || [];

         let statusCol = 10;
         let studentName = rowData[1] || 'Student Developer'; // Col 2 default (Full Name)
         let studentEmail = rowData[2] || '';                // Col 3 default (Student Email)
         let projectTitle = rowData[4] || 'Project Submission'; // Col 5 default (Project Title)

         headerRow.forEach((header, idx) => {
            const h = String(header).trim().toLowerCase();
            if (h === 'status') statusCol = idx + 1;
            if (h === 'email' || h === 'student email') studentEmail = rowData[idx] || studentEmail;
            if (h === 'fullname' || h === 'full name' || h === 'name') studentName = rowData[idx] || studentName;
            if (h === 'title' || h === 'project title' || h === 'project / product title') projectTitle = rowData[idx] || projectTitle;
         });

         const newStatus = params.action === 'approve' ? 'Approved' : 'Rejected';
         sheet.getRange(rowIndex, statusCol).setValue(newStatus);

         // AUTO-NOTIFY STUDENT VIA EMAIL
         let studentEmailDispatched = false;
         if (studentEmail && String(studentEmail).includes('@')) {
            try {
               sendStudentDecisionNotification(studentEmail, studentName, projectTitle, params.action);
               studentEmailDispatched = true;
            } catch (studentErr) {
               console.error('Failed to send auto-reply to student:', studentErr);
            }
         }

         const actionColor = params.action === 'approve' ? '#039133' : '#ef4444';
         const actionTitle = params.action === 'approve' ? 'Submission Approved!' : 'Submission Rejected';
         let actionMessage = params.action === 'approve'
            ? `Project <strong>"${escapeHtml(projectTitle)}"</strong> by <strong>${escapeHtml(studentName)}</strong> (Row #${rowIndex}) has been marked as <strong>Approved</strong> and published to the live Student Showcase.`
            : `Project <strong>"${escapeHtml(projectTitle)}"</strong> by <strong>${escapeHtml(studentName)}</strong> (Row #${rowIndex}) has been marked as <strong>Rejected</strong> and hidden from the public showcase.`;

         if (studentEmailDispatched) {
            actionMessage += `<br/><br/><span style="color:#039133; font-weight:600;">✓ An automated notification email has been dispatched to ${escapeHtml(studentName)} (${escapeHtml(studentEmail)}).</span>`;
         } else if (studentEmail) {
            actionMessage += `<br/><br/><span style="color:#64748b; font-size:13px;">(Student email recorded: ${escapeHtml(studentEmail)})</span>`;
         }

         return HtmlService.createHtmlOutput(renderStatusCard(actionTitle, actionMessage, actionColor, true));
      }

      // ----------------------------------------------------------------------
      // B. DATA API (READ DATA FOR FRONTEND: Events, Hackathons, Showcase)
      // ----------------------------------------------------------------------
      if (params.sheet || params.type) {
         let targetSheetName = params.sheet;
         if (params.type && SHEET_MAP[params.type]) {
            targetSheetName = SHEET_MAP[params.type].sheetName;
         }

         const sheet = SPREADSHEET.getSheetByName(targetSheetName);
         if (!sheet) {
            return ContentService.createTextOutput(
               JSON.stringify({ status: 'error', message: `Sheet "${targetSheetName}" not found.` })
            ).setMimeType(ContentService.MimeType.JSON);
         }

         const values = sheet.getDataRange().getValues();
         if (values.length <= 1) {
            return ContentService.createTextOutput(
               JSON.stringify({ status: 'success', sheet: targetSheetName, count: 0, data: [] })
            ).setMimeType(ContentService.MimeType.JSON);
         }

         const rawHeaders = values[0];
         const headers = rawHeaders.map(h => toCamelCase(String(h).trim()));
         const rows = values.slice(1);

         let records = rows.map((row, index) => {
            const obj = { _rowNumber: index + 2 };
            headers.forEach((header, colIndex) => {
               if (header) {
                  let val = row[colIndex];
                  if (header === 'tags' && typeof val === 'string') {
                     val = val.split(',').map(t => t.trim()).filter(Boolean);
                  }
                  obj[header] = val !== undefined ? val : '';
               }
            });
            return obj;
         });

         records = records.filter(r => Object.values(r).some(v => v !== '' && v !== null && v !== undefined));

         // Filter for ProductShowcase: only return 'Approved' unless explicitly requested
         if (targetSheetName === 'ProductShowcase' && params.all !== 'true') {
            records = records.filter(item => {
               const status = String(item.status || '').trim().toLowerCase();
               return status === 'approved';
            });
         }

         // Reverse order (newest first)
         records.reverse();

         return ContentService.createTextOutput(
            JSON.stringify({ status: 'success', sheet: targetSheetName, count: records.length, data: records })
         ).setMimeType(ContentService.MimeType.JSON);
      }

      // ----------------------------------------------------------------------
      // C. DEFAULT HEALTH CHECK
      // ----------------------------------------------------------------------
      return ContentService.createTextOutput(
         JSON.stringify({
            status: 'active',
            message: 'NACOSS FUOYE Portal Form & Data API is running!',
            endpoints: {
               readEvents: '?sheet=Events',
               readHackathons: '?sheet=Hackathons',
               readShowcase: '?sheet=ProductShowcase',
            }
         })
      ).setMimeType(ContentService.MimeType.JSON);

   } catch (err) {
      console.error('doGet error:', err);
      return ContentService.createTextOutput(
         JSON.stringify({ status: 'error', message: err.toString() })
      ).setMimeType(ContentService.MimeType.JSON);
   }
}

// =============================================================================
// 4. AUTOMATED NOTIFICATION TO STUDENT ON ACCEPT / REJECT
// =============================================================================
function sendStudentDecisionNotification(studentEmail, studentName, projectTitle, action) {
   const isApproved = action === 'approve';
   const subject = isApproved 
      ? `🎉 Congratulations! Your Project "${projectTitle}" is Approved - NACOSS FUOYE`
      : `Update Regarding Your Submission: "${projectTitle}" - NACOSS FUOYE`;

   let plainBody = '';
   let htmlBody = '';

   if (isApproved) {
      plainBody = `Hello ${studentName},\n\n` +
         `Great news! Your project "${projectTitle}" has been reviewed and officially APPROVED by the NACOSS FUOYE Technical Directorate.\n\n` +
         `Your project is now featured live on the NACOSS FUOYE BuildLab Student Showcase for all students, alumni, and tech enthusiasts to see!\n\n` +
         `View the showcase: https://nacossfuoye.vercel.app/buildlab\n\n` +
         `Keep building,\n` +
         `Technical Directorate & Executive Council\n` +
         `NACOSS FUOYE Chapter`;

      htmlBody = `
         <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #039133 0%, #026624 100%); padding: 28px 24px; text-align: center; color: white;">
               <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">BuildLab Showcase Notice</span>
               <h1 style="margin: 12px 0 0 0; font-size: 22px; font-weight: 800;">Your Project is Live! 🎉</h1>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6; font-size: 14px;">
               <p>Hello <strong>${escapeHtml(studentName)}</strong>,</p>
               <p>We are excited to inform you that your application/product <strong>"${escapeHtml(projectTitle)}"</strong> has been reviewed and officially <strong>APPROVED</strong> by the Department Technical Directorate.</p>
               <p>Your work is now featured live on the official <strong>BuildLab Student Showcase</strong>!</p>
               <div style="text-align: center; margin: 24px 0;">
                  <a href="https://nacossfuoye.vercel.app/buildlab" target="_blank" style="display: inline-block; background-color: #039133; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none;">
                     View Your Project on Showcase &rarr;
                  </a>
               </div>
               <p style="font-size: 13px; color: #64748b;">Keep pushing the limits of technology and inspiring your peers across the department.</p>
               <p style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8;">
                  Best regards,<br/>
                  <strong>Directorate of Software & Technical Projects</strong><br/>
                  NACOSS FUOYE Chapter
               </p>
            </div>
         </div>
      `;
   } else {
      plainBody = `Hello ${studentName},\n\n` +
         `Thank you for taking the time to submit "${projectTitle}" to the NACOSS FUOYE BuildLab.\n\n` +
         `After careful review by the Technical Directorate, your submission was not approved for publication on the public showcase at this time.\n\n` +
         `This may be due to incomplete documentation, demo availability, or ongoing development needs. We strongly encourage you to continue refining your project!\n\n` +
         `If you would like direct engineering support or feedback, please reach out to the Software Director.\n\n` +
         `Best regards,\n` +
         `Technical Directorate & Executive Council\n` +
         `NACOSS FUOYE Chapter`;

      htmlBody = `
         <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 28px 24px; text-align: center; color: white;">
               <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">BuildLab Review Notice</span>
               <h1 style="margin: 12px 0 0 0; font-size: 20px; font-weight: 700;">Submission Status Update</h1>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6; font-size: 14px;">
               <p>Hello <strong>${escapeHtml(studentName)}</strong>,</p>
               <p>Thank you for submitting <strong>"${escapeHtml(projectTitle)}"</strong> to the NACOSS FUOYE BuildLab.</p>
               <p>After review by the executive technical team, your submission was <strong>not approved</strong> for the public showcase at this time.</p>
               <p style="background: #f8fafc; padding: 12px 16px; border-left: 3px solid #cbd5e1; border-radius: 4px; font-size: 13px; color: #475569;">
                  Common reasons include non-functional demo links, incomplete project descriptions, or code still requiring core features. This is not the end of your project journey!
               </p>
               <p>We strongly encourage you to iterate, refine your work, and resubmit once updated. If you would like feedback or assistance, feel free to connect with the Technical Directorate.</p>
               <p style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8;">
                  Best regards,<br/>
                  <strong>Directorate of Software & Technical Projects</strong><br/>
                  NACOSS FUOYE Chapter
               </p>
            </div>
         </div>
      `;
   }

   MailApp.sendEmail({
      to: studentEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'NACOSS FUOYE BuildLab',
   });
}

// =============================================================================
// 5. EMAIL NOTIFICATION TO EXECUTIVES
// =============================================================================
function sendSubmissionNotification(config, data, type, rowIndex) {
   const recipients = NOTIFICATION_EMAILS.filter(
      (email) => email && email.includes('@') && !email.includes('example.com')
   );

   if (recipients.length === 0) {
      console.warn('No valid notification recipients configured.');
      return;
   }

   const timestamp = data.timestamp 
      ? new Date(data.timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) 
      : new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

   const subjectTitle = data.softwareName || data.title || data.fullName || 'New Submission';
   const subject = `[NACOSS Portal] New ${config.label}: ${subjectTitle}`;
   const fields = config.getFields(data);
   const spreadsheetUrl = SPREADSHEET.getUrl();

   // Generate 1-Click approval links for Product Showcase
   let approvalBlockHtml = '';
   let approvalBlockText = '';

   if (type === 'product_showcase' && rowIndex) {
      let webAppUrl = '';
      try {
         webAppUrl = ScriptApp.getService().getUrl();
      } catch (e) {
         webAppUrl = '';
      }

      if (webAppUrl) {
         const secretKey = getApprovalSecret();
         const approveUrl = `${webAppUrl}?action=approve&type=product_showcase&row=${rowIndex}&key=${encodeURIComponent(secretKey)}`;
         const rejectUrl = `${webAppUrl}?action=reject&type=product_showcase&row=${rowIndex}&key=${encodeURIComponent(secretKey)}`;

         approvalBlockText = `\n1-CLICK EXECUTIVE APPROVAL:\n` +
            `• Approve & Publish to Portal: ${approveUrl}\n` +
            `• Reject Submission: ${rejectUrl}\n`;

         approvalBlockHtml = `
            <div style="margin-top: 24px; padding: 20px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
                Executive Action: Publish to Student Showcase?
              </p>
              <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <a href="${approveUrl}" target="_blank" style="display: inline-block; background-color: #039133; color: #ffffff; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin: 4px;">
                  ✅ Approve & Publish
                </a>
                <a href="${rejectUrl}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin: 4px;">
                  ❌ Reject
                </a>
              </div>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                Clicking either button will update the spreadsheet and automatically send an email update to the student!
              </p>
            </div>
         `;
      }
   }

   // Plain text fallback
   let plainBody = `NACOSS FUOYE PORTAL - NEW ${config.label.toUpperCase()}\n`;
   plainBody += `Time: ${timestamp} (WAT)\n`;
   plainBody += `----------------------------------------------------\n`;
   fields.forEach(field => {
      plainBody += `${field.label}: ${field.value || 'N/A'}\n`;
   });
   plainBody += `----------------------------------------------------\n`;
   plainBody += approvalBlockText;
   plainBody += `View all records in Google Sheets: ${spreadsheetUrl}\n`;

   // Rich HTML Email
   const rowsHtml = fields.map(field => {
      let valHtml = escapeHtml(field.value || 'N/A');

      if (field.value) {
         if (field.isLink) {
            valHtml = `<a href="${escapeHtml(field.value)}" target="_blank" style="color: #039133; font-weight: 600; text-decoration: underline;">${escapeHtml(field.value)}</a>`;
         } else if (field.isPhone) {
            const cleanPhone = field.value.replace(/[^0-9+]/g, '');
            valHtml = `<a href="tel:${cleanPhone}" style="color: #039133; font-weight: 600; text-decoration: none;">${escapeHtml(field.value)}</a> <span style="color:#64748b; font-size:12px;">(<a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" style="color:#25d366; text-decoration:underline;">Chat on WhatsApp</a>)</span>`;
         } else if (field.isEmail) {
            valHtml = `<a href="mailto:${escapeHtml(field.value)}" style="color: #039133; font-weight: 600; text-decoration: none;">${escapeHtml(field.value)}</a>`;
         }
      }

      return `
         <tr style="border-bottom: 1px solid #e2e8f0;">
           <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #475569; width: 35%; background-color: #f8fafc; vertical-align: top;">
             ${escapeHtml(field.label)}
           </td>
           <td style="padding: 10px 14px; font-size: 14px; color: #0f172a; vertical-align: top;">
             ${valHtml}
           </td>
         </tr>
      `;
   }).join('');

   const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #039133 0%, #026624 100%); padding: 24px 28px; text-align: left;">
              <span style="display: inline-block; padding: 4px 10px; background-color: rgba(255,255,255,0.2); border-radius: 9999px; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                NACOSS FUOYE Portal Alert
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; line-height: 1.3;">
                New ${escapeHtml(config.label)}
              </h1>
              <p style="margin: 6px 0 0 0; color: #dcfce7; font-size: 13px;">
                Submitted on ${escapeHtml(timestamp)} (WAT)
              </p>
            </td>
          </tr>

          <!-- BODY / TABLE -->
          <tr>
            <td style="padding: 24px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.5;">
                Hello Executive, a new response has been submitted on the NACOSS FUOYE portal. Below are the details:
              </p>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- 1-CLICK APPROVAL BUTTONS (If applicable) -->
              ${approvalBlockHtml}

              <!-- ACTION BUTTON: OPEN SPREADSHEET -->
              <div style="margin-top: 24px; text-align: center;">
                <a href="${escapeHtml(spreadsheetUrl)}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                  Open Full Spreadsheet &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                This is an automated notification from the <strong>NACOSS FUOYE Portal</strong>.<br/>
                Department of Computer Science, Federal University Oye-Ekiti.
              </p>
            </td>
          </tr>

        </table>
      </body>
    </html>
   `;

   MailApp.sendEmail({
      to: recipients.join(','),
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'NACOSS FUOYE Portal',
   });
}

function renderStatusCard(title, message, color, isSuccess) {
   return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - NACOSS FUOYE</title>
        </head>
        <body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 80vh;">
          <div style="max-width: 480px; width: 100%; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07); padding: 36px; text-align: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background-color: ${color}15; color: ${color}; font-size: 28px; line-height: 56px; margin: 0 auto 16px auto;">
              ${isSuccess ? '✓' : '!'}
            </div>
            <h1 style="margin: 0 0 10px 0; color: #0f172a; font-size: 22px; font-weight: 700;">${title}</h1>
            <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">${message}</p>
            <div style="padding-top: 16px; border-top: 1px solid #f1f5f9;">
              <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">NACOSS FUOYE PORTAL GOVERNANCE</span>
            </div>
          </div>
        </body>
      </html>
   `;
}

function toCamelCase(str) {
   return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
}

function escapeHtml(text) {
   if (text === null || text === undefined) return '';
   return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

function testNotificationEmail() {
   const sampleData = {
      type: 'product_showcase',
      fullName: 'Test Student Developer',
      email: 'nb.nicholasbenson@gmail.com',
      level: '300 Level',
      title: 'Smart Campus Navigation System',
      demoUrl: 'https://campus-nav.vercel.app',
      githubUrl: 'https://github.com/nacossfuoye/campus-nav',
      phone: '+2348012345678',
      desc: 'An interactive 3D map and navigation guide for FUOYE students to find lecture halls and departmental offices.',
      timestamp: new Date().toISOString(),
   };

   const config = SHEET_MAP[sampleData.type];
   let sheet = SPREADSHEET.getSheetByName(config.sheetName);
   if (!sheet) {
      sheet = SPREADSHEET.insertSheet(config.sheetName);
      sheet.appendRow([
         'Timestamp', 'Full Name', 'Student Email', 'Academic Level',
         'Project Title', 'Demo URL', 'GitHub URL', 'Phone', 'Description', 'Status'
      ]);
   }

   // Append test row so row actually exists in the sheet to be approved or rejected!
   sheet.appendRow(config.mapRow(sampleData));
   const rowIndex = sheet.getLastRow();

   sendSubmissionNotification(config, sampleData, sampleData.type, rowIndex);
   Logger.log(`Test submission recorded in row #${rowIndex} of "${config.sheetName}". Notification email dispatched!`);
}

/**
 * Quick setup helper: Run this once in the Apps Script editor to securely generate
 * and save your approval secret in Google Script Properties:
 */
function setupApprovalSecret() {
   const secureToken = Utilities.getUuid();
   PropertiesService.getScriptProperties().setProperty('APPROVAL_SECRET', secureToken);
   Logger.log('Secure APPROVAL_SECRET generated and saved to Script Properties: ' + secureToken);
}

