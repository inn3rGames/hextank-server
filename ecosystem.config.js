module.exports = {
    apps: [
        {
            name: "hextank-server",
            script: "./index.js",
            node_args: ["--max-old-space-size=2048"],
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
