module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      }
    },
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    }
  };
};