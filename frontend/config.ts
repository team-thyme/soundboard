export const config = {
    versionNumber: '3.4.2',
    versionName: 'je moet niet kijken, je moet zien',
    versionSampleHash: '1098b172',
    repositoryUrl: 'https://github.com/team-thyme/soundboard',
    baseUrl: (process.env.BASE_URL || '/').replace(/\/$/, '') + '/',
    apiBaseUrl: (process.env.API_BASE_URL || 'http://localhost:32658').replace(
        /\/$/,
        '',
    ),
    contributeUrl:
        process.env.CONTRIBUTE_URL ||
        'https://docs.google.com/document/d/1tDlWfX2TtczI5IHLmffY4LPya1J1Z9ZWHW4pYlD8toM/edit?usp=sharing',
};
