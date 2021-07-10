module.exports = {
  collatorSshPrivateKeyPath: process.env.SSH_ID_RSA_COLLATOR,
  publicNodeSshPrivateKeyPath: process.env.SSH_ID_RSA_PUBLIC,
  nginxUsername: process.env.NGINX_USERNAME || "prometheus",
  nginxPassword: process.env.NGINX_PASSWORD || "nginx_password",
};
