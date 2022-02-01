module.exports = {
	publicPath: process.env.NODE_ENV === "production" ? "./" : "./",
	pwa: {
		name: "Senses - App",
		themeColor: "#1f2328",
		msTileColor: "#1f2328",
		appleMobileWebAppCapable: "yes",
		appleMobileWebAppStatusBarStyle: "black",
		workboxOptions: {
            skipWaiting: true
        }
	},
};
