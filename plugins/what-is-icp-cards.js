const fs = require("fs");
const path = require("path");
const marked = require("marked");
const matter = require("gray-matter");
const logger = require("@docusaurus/logger");

function getItems(baseDir) {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const files = fs
    .readdirSync(baseDir, {
      withFileTypes: true,
    })
    .filter((d) => d.isFile() && d.name.endsWith(".md"));

  return files.map((file) => {
    const meta = matter(
      fs.readFileSync(path.resolve(baseDir, file.name), { encoding: "utf-8" })
    );

    return {
      name: meta.data.title,
      description: marked.parse(meta.content),
      links: Object.keys(meta.data.links)
        .filter((title) => !!meta.data.links[title])
        .map((title) => ({
          text: title,
          url: meta.data.links[title],
        })),
      is_community: meta.data.is_community,
      in_beta: meta.data.in_beta,
      eta: meta.data.eta,
    };
  });
}

/** @type {import('@docusaurus/types').PluginModule} */
const whatIsIcpDataPlugin = async function () {
  return {
    name: "what-is-icp-data",
    async loadContent() {
      const domains = [];

      const dirs = fs
        .readdirSync(path.resolve(__dirname, "..", "what-is-icp"), {
          withFileTypes: true,
        })
        .filter((d) => d.isDirectory());

      for (const dir of dirs) {
        const indexPath = path.resolve(
          __dirname,
          "..",
          "what-is-icp",
          dir.name,
          "index.md"
        );

        if (!fs.existsSync(indexPath)) {
          logger.warn(
            `Warning: no index.md file for what-is-icp topic "${dir.name}"`
          );
          continue;
        }

        const meta = matter(fs.readFileSync(indexPath, { encoding: "utf-8" }));

        const baseDir = path.resolve(__dirname, "..", "what-is-icp", dir.name);

        domains.push({
          name: meta.data.title,
          description: marked.parse(meta.content),
          image: {
            card: meta.data.card,
            overlay: meta.data.overlay,
          },
          // groups: {
          //   deployed: getItems(path.join(baseDir, "deployed")),
          //   inProgress: getItems(path.join(baseDir, "in-progress")),
          //   pending: getItems(path.join(baseDir, "pending")),
          // },
        });
      }
      // console.log(JSON.stringify(domains, null, 2));

      return domains;
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      setGlobalData(content);
    },
  };
};

module.exports = whatIsIcpDataPlugin;

// RoadmapDataPlugin().then((x) => x.loadContent());
