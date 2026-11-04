import { NextResponse } from 'next/server';

export const revalidate = 900; // Cache for 15 minutes

const REPO_OWNER = 'nickfrostech';
const REPO_NAME = 'nacossfuoye';

// Fallback snapshot data in case GitHub API is unreachable or rate limited
const FALLBACK_STATS = {
   repo: {
      name: 'nacossfuoye',
      fullName: 'nickfrostech/nacossfuoye',
      url: 'https://github.com/nickfrostech/nacossfuoye',
      description: 'Official open-source portal for the Department of Computer Science, FUOYE.',
      stars: 2,
      forks: 4,
      openIssues: 6,
      subscribers: 2,
      defaultBranch: 'main',
      license: 'Departmental License',
   },
   contributors: [
      {
         login: 'nickfrostech',
         name: 'Nicholas Benson (Nick Frost)',
         avatar_url: 'https://avatars.githubusercontent.com/u/166176427?v=4',
         html_url: 'https://github.com/nickfrostech',
         contributions: 60,
      },
      {
         login: 'apreezofficial',
         name: 'Precious Adedokun (apcodesphere)',
         avatar_url: 'https://avatars.githubusercontent.com/u/193069706?v=4',
         html_url: 'https://github.com/apreezofficial',
         contributions: 5,
      },
   ],
   contributorsCount: 2,
   issuesBreakdown: {
      totalOpen: 6,
      pureIssues: 4,
      openPullRequests: 2,
      byType: {
         bugs: 2,
         features: 2,
         goodFirstIssue: 0,
      },
   },
   updatedAt: new Date().toISOString(),
   isLive: false,
};

export async function GET() {
   try {
      const headers = {
         Accept: 'application/vnd.github.v3+json',
         'User-Agent': 'NACOSS-FUOYE-Portal-App',
      };

      if (process.env.GITHUB_TOKEN) {
         headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const [repoRes, contributorsRes, issuesRes] = await Promise.allSettled([
         fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
            headers,
            next: { revalidate: 900 },
         }),
         fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100`, {
            headers,
            next: { revalidate: 900 },
         }),
         fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&per_page=100`, {
            headers,
            next: { revalidate: 900 },
         }),
      ]);

      if (repoRes.status !== 'fulfilled' || !repoRes.value.ok) {
         return NextResponse.json(FALLBACK_STATS);
      }

      const repoData = await repoRes.value.json();

      let contributors = FALLBACK_STATS.contributors;
      let contributorsCount = FALLBACK_STATS.contributorsCount;

      if (contributorsRes.status === 'fulfilled' && contributorsRes.value.ok) {
         const contribData = await contributorsRes.value.json();
         if (Array.isArray(contribData) && contribData.length > 0) {
            contributors = contribData.map((c) => ({
               login: c.login,
               avatar_url: c.avatar_url,
               html_url: c.html_url,
               contributions: c.contributions,
            }));
            contributorsCount = contribData.length;
         }
      }

      let issuesBreakdown = FALLBACK_STATS.issuesBreakdown;

      if (issuesRes.status === 'fulfilled' && issuesRes.value.ok) {
         const issuesData = await issuesRes.value.json();
         if (Array.isArray(issuesData)) {
            const pullRequests = issuesData.filter((i) => !!i.pull_request);
            const actualIssues = issuesData.filter((i) => !i.pull_request);

            const bugs = actualIssues.filter((i) =>
               i.labels?.some((l) => (typeof l === 'string' ? l : l.name)?.toLowerCase().includes('bug'))
            ).length;

            const features = actualIssues.filter((i) =>
               i.labels?.some((l) => {
                  const name = (typeof l === 'string' ? l : l.name)?.toLowerCase();
                  return name.includes('enhancement') || name.includes('feat') || name.includes('feature');
               })
            ).length;

            const goodFirstIssue = actualIssues.filter((i) =>
               i.labels?.some((l) => {
                  const name = (typeof l === 'string' ? l : l.name)?.toLowerCase();
                  return name.includes('good first') || name.includes('help wanted');
               })
            ).length;

            issuesBreakdown = {
               totalOpen: issuesData.length,
               pureIssues: actualIssues.length,
               openPullRequests: pullRequests.length,
               byType: {
                  bugs,
                  features,
                  goodFirstIssue,
               },
            };
         }
      }

      return NextResponse.json({
         repo: {
            name: repoData.name,
            fullName: repoData.full_name,
            url: repoData.html_url,
            description: repoData.description || FALLBACK_STATS.repo.description,
            stars: repoData.stargazers_count ?? FALLBACK_STATS.repo.stars,
            forks: repoData.forks_count ?? FALLBACK_STATS.repo.forks,
            openIssues: repoData.open_issues_count ?? FALLBACK_STATS.repo.openIssues,
            subscribers: repoData.subscribers_count ?? FALLBACK_STATS.repo.subscribers,
            defaultBranch: repoData.default_branch || 'main',
            license: repoData.license?.name || FALLBACK_STATS.repo.license,
         },
         contributors,
         contributorsCount,
         issuesBreakdown,
         updatedAt: new Date().toISOString(),
         isLive: true,
      });
   } catch {
      return NextResponse.json(FALLBACK_STATS);
   }
}
