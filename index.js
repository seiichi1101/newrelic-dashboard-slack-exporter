const NEWRELIC_GUID = process.env.NEWRELIC_GUID;
const NEWRELIC_APIKEY = process.env.NEWRELIC_APIKEY;
const SLACK_PATH = process.env.SLACK_PATH;
const SLACK_SUBJECT = process.env.SLACK_SUBJECT;

const https = require("https");

exports.handler = async (event) => {
  const pages = await getDashboardPages(NEWRELIC_APIKEY, NEWRELIC_GUID);
  console.log(pages);

  for (const page of pages) {
    let PDF_URL = await generateSnapshot(NEWRELIC_APIKEY, page.guid);
    const PNG_URL = PDF_URL.replace("format=PDF", "format=PNG") + "&width=2000";
    await notifySlack(SLACK_PATH, SLACK_SUBJECT + "-" + page.name, PNG_URL);
  }
};

const getDashboardPages = (apikey, guid) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query:
        `{
      actor {
          entitySearch(query: "parentId ='` +
        guid +
        `' or id ='` +
        guid +
        `'") {
            results {
              entities {
                guid
                name
                ... on DashboardEntityOutline {
                  guid
                  name
                  dashboardParentGuid
                }
              }
            }
          }
        }
      }
    `,
    });
    const options = {
      hostname: "api.newrelic.com",
      port: 443,
      path: "/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apikey,
      },
    };
    const req = https.request(options, (res) => {
      res.on("data", (body) => {
        const bodyObj = JSON.parse(body);
        const entities = bodyObj.data.actor.entitySearch.results.entities;
        if (entities.length > 0) {
          if (entities.length > 1) {
            resolve(
              entities.filter((e) => {
                return e.dashboardParentGuid !== null;
              })
            );
          } else {
            resolve([entities[0]]);
          }
        } else {
          reject("Snapshot URL not found in body: " + body);
        }
      });
    });
    req.on("error", (e) => {
      reject(e);
    });
    req.write(postData);
    req.end();
  });
};

const generateSnapshot = (apikey, guid) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: 'mutation { dashboardCreateSnapshotUrl(guid: "' + guid + '")}',
    });
    const options = {
      hostname: "api.newrelic.com",
      port: 443,
      path: "/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apikey,
      },
    };

    const req = https.request(options, (res) => {
      res.on("data", (body) => {
        const bodyObj = JSON.parse(body);
        if (bodyObj.data && bodyObj.data.dashboardCreateSnapshotUrl) {
          resolve(bodyObj.data.dashboardCreateSnapshotUrl);
        } else {
          reject("Snapshot URL not found in body: " + body);
        }
      });
    });
    req.on("error", (e) => {
      reject(e);
    });
    req.write(postData);
    req.end();
  });
};

var notifySlack = function (path, subject, imageUrl) {
  return new Promise((resolve, reject) => {
    let blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: subject,
          emoji: true,
        },
      },
      {
        type: "image",
        image_url: imageUrl,
        alt_text: subject,
      },
    ];
    postData = JSON.stringify({ blocks: blocks });
    const options = {
      hostname: "hooks.slack.com",
      port: 443,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      res.on("data", () => {
        resolve();
      });
    });
    req.on("error", (e) => {
      reject(e);
    });
    req.write(postData);
    req.end();
  });
};
