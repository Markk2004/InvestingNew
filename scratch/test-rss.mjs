import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [["source", "source"]],
  },
  timeout: 10000,
});

async function run() {
  const query = "Trump OR FED OR Politics OR Economy";
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  console.log("Fetching RSS...");
  const feed = await parser.parseURL(url);
  console.log(`Fetched ${feed.items.length} items`);
  for (let i = 0; i < 5; i++) {
    const item = feed.items[i];
    if (!item) break;
    console.log(`\nItem ${i + 1}:`);
    console.log(`Title: ${item.title}`);
    console.log(`Link: ${item.link}`);
    console.log(`Source: ${JSON.stringify(item.source)}`);
    console.log(`Creator: ${item.creator}`);
  }
}

run().catch(console.error);
