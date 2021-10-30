let idRule = 1

const clearDynamicRules = () => {
  return chrome.declarativeNetRequest.getDynamicRules().then((value) => {
    console.log(value, 'remove')
    return chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [],
      removeRuleIds: value.map(({ id }) => id),
    })
  })
}

export const updateDynamicRules = async (rules) => {
  await clearDynamicRules()

  const addRules = rules.map(({ requestHeaders, domains, urlFilter }) => {
    idRule += 1
    return {
      id: idRule,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders,
      },
      condition: {
        urlFilter,
        domains,
        resourceTypes: ['xmlhttprequest'],
      },
    }
  })

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules,
    removeRuleIds: [],
  })
}
