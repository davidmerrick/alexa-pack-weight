import AlexaAppServer from 'alexa-app-server'

var instance = AlexaAppServer.start({
    server_root: __dirname,     // Path to root
    public_html: "public_html", // Static content
    app_dir: __dirname,            // Location of alexa-app modules
    app_root: "/src/",        // Service root
    port: 8080                  // Port to use
});