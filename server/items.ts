let itemMap: Record<number, string> = {};

export async function loadItemData() {
  const versionRes = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  const [latestVersion] = await versionRes.json();

  const itemRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`
  );
  const itemData = await itemRes.json();

  for (const id in itemData.data) {
    itemMap[Number(id)] = itemData.data[id].name;
  }
}

export function getItemName(itemId: number) {
  return itemMap[itemId] ?? `Unknown (${itemId})`;
}
