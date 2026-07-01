(() => {
  const parseCommission = (text) => {
    const matches = [...String(text || '').matchAll(/(\d+(?:\.\d+)?)\s*%/g)]
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value) && value > 0 && value <= 100)
    return matches.length ? Math.max(...matches) : null
  }

  const firstShopNameLine = (text) => {
    const blocked = [
      'สูงสุด',
      'คอมมิชชั่น',
      'commission',
      'วันเริ่มต้น',
      'วันสิ้นสุด',
      'ดูรายละเอียด',
      'เอาลิงก์',
      'เลือกร้านค้า'
    ]
    return String(text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .find((line) => {
        const lower = line.toLowerCase()
        return !blocked.some((word) => lower.includes(word)) && !/\d+(?:\.\d+)?\s*%/.test(line)
      }) || ''
  }

  const rowNodes = [
    ...document.querySelectorAll('tbody tr'),
    ...document.querySelectorAll('[role="row"]'),
    ...document.querySelectorAll('.eds-table__row, .shopee-table__row')
  ]

  const uniqueNodes = [...new Set(rowNodes)].filter((node) => parseCommission(node.innerText) !== null)
  const sourceNodes = uniqueNodes.length ? uniqueNodes : [document.body]

  const offers = sourceNodes
    .map((node) => {
      const text = node.innerText || ''
      const commission = parseCommission(text)
      const shopName = firstShopNameLine(text)
      const link = [...node.querySelectorAll('a[href]')]
        .map((anchor) => anchor.href)
        .find((href) => /shopee\./i.test(href)) || ''
      if (!commission || !shopName) return null
      return {
        shop_name: shopName,
        commission_rate: commission,
        affiliate_url: link,
        source: 'shopee-dashboard-dom',
        offer_type: 'shop'
      }
    })
    .filter(Boolean)

  const deduped = [...new Map(offers.map((offer) => [offer.shop_name.toLowerCase(), offer])).values()]
  const blob = new Blob([JSON.stringify(deduped, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `shopee-offers-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  console.table(deduped)
  return deduped
})()
