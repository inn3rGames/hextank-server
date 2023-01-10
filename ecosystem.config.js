module.exports = {
    apps: [
        {
            name: "hextank-server",
            script: "./index.js",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
