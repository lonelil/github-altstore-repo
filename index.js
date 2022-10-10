const fetch = require("node-fetch");
const fse = require("fs-extra");
let apps = require("./apps.json");

apps.forEach((app) => {
  fetch(`https://api.github.com/repos/${app.github_repo}/releases`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "lonelil/github-altstore-repo",
    },
  })
    .then((res) => res.json())
    .then((releases) => {
      let done = {
        apps: [],
        identifier: `com.lonelil.github-altstore-repo.${app.github_repo}`,
        name: app.name,
        news: [],
        userInfo: {},
      };
      releases.forEach((release) => {
        release.assets
          .filter((asset) => asset.name.endsWith(".ipa"))
          .forEach((asset) => {
            done.apps.push({
              beta: false,
              bundleIdentifier: app.bundleIdentifier,
              developerName: release.author.login,
              downloadURL: asset.browser_download_url,
              name: `${release.name} (${asset.name})`,
              version: release.tag_name.replace("v", ""),
              versionDate: release.published_at,
              versionDescription: release.body,
              size: asset.size,
              iconURL: app.iconURL,
            });
          });
      });

      fse.outputFileSync(
        `./apps/${app.github_repo}.json`,
        JSON.stringify(done, null, 2)
      );
    });
});
