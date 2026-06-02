import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [["source", "source"]],
  },
  timeout: 10000,
});

async function run() {
  const url = "https://trumpstruth.org/feed";
  console.log("Fetching RSS from " + url);
  try {
    const feed = await parser.parseURL(url);
    console.log(`Fetched ${feed.items.length} items`);
    for (let i = 0; i < 5; i++) {
      const item = feed.items[i];
      if (!item) break;
      console.log(`\nItem ${i + 1}:`);
      console.log(`Title: ${item.title}`);
      console.log(`Link: ${item.link}`);
      console.log(`Creator: ${item.creator}`);
      console.log(`PubDate: ${item.pubDate}`);
      console.log(`IsoDate: ${item.isoDate}`);
      console.log(`Content: ${item.contentSnippet || item.content}`);
    }
  } catch (err) {
    console.error("Error fetching feed:", err);
  }
}

run().catch(console.error);
