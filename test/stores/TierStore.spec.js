import TierStore from '../../src/stores/TierStore'

describe('TierStore', () => {
  let whitelist
  let tierStore

  beforeEach(() => {
    tierStore = new TierStore()

    whitelist = [
      { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1234, max: 50505 },
      { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 1234, max: 50505 },
      { addr: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b', min: 1234, max: 50505 },
      { addr: '0xe11ba2b4d45eaed5996cd0823791e0c93114882d', min: 1234, max: 50505 },
      { addr: '0xd03ea8624c8c5987235048901fb614fdca89b117', min: 1234, max: 50505 },
      { addr: '0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc', min: 1234, max: 50505 },
      { addr: '0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9', min: 1234, max: 50505 },
      { addr: '0x28a8746e75304c0780e011bed21c72cd78cd535e', min: 1234, max: 50505 },
      { addr: '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e', min: 1234, max: 50505 },
      { addr: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e', min: 1234, max: 50505 }
    ]

    tierStore.addTier({ whitelist: [] })
  })

  afterEach(() => {
    tierStore.reset()
  })

  describe('maxSupply', () => {
    const testCases = [
      {
        tiers: [],
        expected: 0
      },
      {
        tiers: [5],
        expected: 5
      },
      {
        tiers: [5, 10],
        expected: 10
      },
      {
        tiers: [10, 5],
        expected: 10
      },
      {
        tiers: [10, 10],
        expected: 10
      }
    ]

    testCases.forEach(({ tiers, expected }) => {
      it(`should get the max supply for tiers ${JSON.stringify(tiers)}`, () => {
        tierStore.emptyList()
        tiers.forEach(tier =>
          tierStore.addTier({
            supply: tier
          })
        )

        const result = tierStore.maxSupply

        expect(result).toEqual(expected)
      })
    })
  })

  describe('sortWhitelist', () => {
    let sortedWhitelist

    beforeEach(() => {
      sortedWhitelist = [
        { addr: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e', min: 1234, max: 50505 },
        { addr: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b', min: 1234, max: 50505 },
        { addr: '0x28a8746e75304c0780e011bed21c72cd78cd535e', min: 1234, max: 50505 },
        { addr: '0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9', min: 1234, max: 50505 },
        { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1234, max: 50505 },
        { addr: '0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc', min: 1234, max: 50505 },
        { addr: '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e', min: 1234, max: 50505 },
        { addr: '0xd03ea8624c8c5987235048901fb614fdca89b117', min: 1234, max: 50505 },
        { addr: '0xe11ba2b4d45eaed5996cd0823791e0c93114882d', min: 1234, max: 50505 },
        { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 1234, max: 50505 }
      ]
    })

    it('Should sort in ascending order', () => {
      tierStore.setTierProperty(whitelist, 'whitelist', 0)
      tierStore.sortWhitelist(0)
      tierStore.tiers[0].whitelist.forEach((item, index) => {
        expect(item.addr).toBe(sortedWhitelist[index].addr)
      })
    })

    it('Should sort in ascending order after adding a duplicated address', () => {
      const sortedWhitelistWithDuplicated = [
        { addr: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e', min: 1234, max: 50505 },
        { addr: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b', min: 1234, max: 50505 },
        { addr: '0x28a8746e75304c0780e011bed21c72cd78cd535e', min: 1234, max: 50505 },
        { addr: '0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9', min: 1234, max: 50505 },
        { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1234, max: 50505 },
        { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 2222, max: 44444 },
        { addr: '0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc', min: 1234, max: 50505 },
        { addr: '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e', min: 1234, max: 50505 },
        { addr: '0xd03ea8624c8c5987235048901fb614fdca89b117', min: 1234, max: 50505 },
        { addr: '0xe11ba2b4d45eaed5996cd0823791e0c93114882d', min: 1234, max: 50505 },
        { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 1234, max: 50505 }
      ]
      const duplicatedAddress = { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 2222, max: 44444 }

      tierStore.setTierProperty(
        whitelist.map(item => {
          item.stored = true
          return item
        }),
        'whitelist',
        0
      )
      tierStore.sortWhitelist(0)
      tierStore.addWhitelistItem(duplicatedAddress, 0)

      tierStore.tiers[0].whitelist.forEach((item, index) => {
        expect(item.addr).toBe(sortedWhitelistWithDuplicated[index].addr)
        expect(item.min).toBe(sortedWhitelistWithDuplicated[index].min)
        expect(item.max).toBe(sortedWhitelistWithDuplicated[index].max)
      })
    })
  })

  describe('removeWhitelistItem', () => {
    it('Should remove the address from the list', () => {
      whitelist.forEach(item => tierStore.addWhitelistItem(item, 0))
      tierStore.removeWhitelistItem(8, 0)

      const itemLookup = tierStore.tiers[0].whitelist.find(
        item => item.addr === '0xe11ba2b4d45eaed5996cd0823791e0c93114882d'
      )

      expect(itemLookup).toBeUndefined()
    })

    it('Should set duplicated to false for the stored address, after removing its duplicate', () => {
      const duplicatedAddress = { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2222, max: 44444 }

      tierStore.setTierProperty(
        whitelist.map(item => {
          item.stored = true
          return item
        }),
        'whitelist',
        0
      )
      tierStore.sortWhitelist(0)
      tierStore.addWhitelistItem(duplicatedAddress, 0)
      tierStore.removeWhitelistItem(10, 0)

      expect(tierStore.tiers[0].whitelist[1].duplicated).toBeFalsy()
    })
  })

  describe('isWhitelistEmpty', () => {
    it('should consider empty lists as empty', () => {
      // Given
      tierStore.setTierProperty([], 'whitelist', 0)

      // When
      const result = tierStore.isWhitelistEmpty(0)

      // Then
      expect(result).toBe(true)
    })
    it('should consider lists with only already stored items as empty', () => {
      // Given
      tierStore.setTierProperty(
        [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10, stored: true },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20, stored: true }
        ],
        'whitelist',
        0
      )

      // When
      const result = tierStore.isWhitelistEmpty(0)

      // Then
      expect(result).toBe(true)
    })
    it('should consider lists with only non-stored items as not empty', () => {
      // Given
      tierStore.setTierProperty(
        [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10 },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20 }
        ],
        'whitelist',
        0
      )

      // When
      const result = tierStore.isWhitelistEmpty(0)

      // Then
      expect(result).toBe(false)
    })
    it('should consider lists with both stored and non-stored items as not empty', () => {
      // Given
      tierStore.setTierProperty(
        [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10, stored: true },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20 },
          { addr: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b', min: 3, max: 30 },
          { addr: '0xe11ba2b4d45eaed5996cd0823791e0c93114882d', min: 4, max: 40, stored: true }
        ],
        'whitelist',
        0
      )

      // When
      const result = tierStore.isWhitelistEmpty(0)

      // Then
      expect(result).toBe(false)
    })
  })

  describe('isWhitelistEmpty', () => {
    ;[
      {
        whitelist: [],
        expected: []
      },
      {
        whitelist: [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10 },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20 }
        ],
        expected: []
      },
      {
        whitelist: [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10 },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20, stored: true }
        ],
        expected: [{ addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20, stored: true }]
      },
      {
        whitelist: [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10, stored: true },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20, stored: true }
        ],
        expected: [
          { addr: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', min: 1, max: 10, stored: true },
          { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2, max: 20, stored: true }
        ]
      }
    ].forEach(({ whitelist, expected }) => {
      it('should remove all non-stored items', () => {
        // Given
        tierStore.setTierProperty(whitelist, 'whitelist', 0)

        // When
        tierStore.emptyWhitelist(0)
        const result = tierStore.tiers[0].whitelist

        // Then
        expect(result.toJS()).toEqual(expected)
      })
    })
  })

  it('Should be truthy "deployedContract" after adding "stored" addresses', () => {
    // set whitelist items as stored
    tierStore.setTierProperty(
      whitelist.map(item => {
        item.stored = true
        return item
      }),
      'whitelist',
      0
    )
    expect(tierStore.deployedContract).toBeTruthy()
  })

  it('Should mark repeated addresses as duplicated', () => {
    const duplicatedAddress = { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2222, max: 44444 }

    // set whitelist items as stored
    tierStore.setTierProperty(
      whitelist.map(item => {
        item.stored = true
        return item
      }),
      'whitelist',
      0
    )
    tierStore.sortWhitelist(0)

    expect(tierStore.tiers[0].whitelist.every(item => item.stored)).toBeTruthy()
    tierStore.addWhitelistItem(duplicatedAddress, 0)

    const storedIndex = tierStore.tiers[0].whitelist.findIndex(item => item.addr === duplicatedAddress.addr)

    expect(tierStore.tiers[0].whitelist[storedIndex].duplicated).toBeTruthy()
    expect(tierStore.tiers[0].whitelist[10].duplicated).toBeTruthy()
  })

  it('Should prevent adding an already duplicated address', () => {
    const firstAddr = { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2222, max: 44444 }
    const secondAddr = { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 7777, max: 44444 }

    tierStore.setTierProperty(
      whitelist.map(item => {
        item.stored = true
        return item
      }),
      'whitelist',
      0
    )
    tierStore.sortWhitelist(0)

    tierStore.addWhitelistItem(firstAddr, 0)
    expect(tierStore.tiers[0].whitelist.length).toBe(11)

    tierStore.addWhitelistItem(secondAddr, 0)
    expect(tierStore.tiers[0].whitelist.length).toBe(11)
    expect(tierStore.tiers[0].whitelist[10].min).toBe(firstAddr.min)
  })

  it('Should prevent adding a duplicated address for a non-stored list', () => {
    const duplicatedAddress = { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2222, max: 44444 }

    whitelist.forEach(item => tierStore.addWhitelistItem(item, 0))
    expect(tierStore.tiers[0].whitelist.length).toBe(10)
    tierStore.addWhitelistItem(duplicatedAddress, 0)
    expect(tierStore.tiers[0].whitelist.length).toBe(10)
  })

  it('Should set as modified the whitelist if an address was added to an "stored" list', () => {
    const duplicatedAddress = { addr: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0', min: 2222, max: 44444 }

    tierStore.setTierProperty(
      whitelist.map(item => {
        item.stored = true
        return item
      }),
      'whitelist',
      0
    )
    tierStore.sortWhitelist(0)

    expect(tierStore.modifiedStoredWhitelist).toBeFalsy()

    tierStore.addWhitelistItem(duplicatedAddress, 0)

    expect(tierStore.modifiedStoredWhitelist).toBeTruthy()
  })

  it('Should return maxCap sum from whitelisted addresses for all tiers', () => {
    tierStore.setTierProperty(whitelist, 'whitelist', 0)
    expect(tierStore.whitelistMaxCapSum).toEqual(['505050'])

    tierStore.addTier({ whitelist: [] })
    tierStore.setTierProperty(whitelist, 'whitelist', 1)
    expect(tierStore.whitelistMaxCapSum).toEqual(['505050', '505050'])
  })

  it(`Should return the remaining supply available after adding addresses to the tier's whitelist`, () => {
    tierStore.setTierProperty(whitelist, 'whitelist', 0)
    tierStore.setTierProperty('505550', 'supply', 0)
    expect(tierStore.tiersSupplyRemaining).toEqual(['500'])

    tierStore.addTier({ whitelist: [] })
    tierStore.setTierProperty(whitelist, 'whitelist', 1)
    tierStore.setTierProperty('505900', 'supply', 1)
    expect(tierStore.tiersSupplyRemaining).toEqual(['500', '850'])
  })

  it(`Should return true if an address was already added to a tier`, () => {
    tierStore.setTierProperty(whitelist, 'whitelist', 0)
    expect(tierStore.whitelistAddressAlreadyAdded(0, whitelist[3].addr)).toBe(true)
  })

  it(`Should return false if an address is not in the list of whitelisted addresses`, () => {
    tierStore.setTierProperty(whitelist, 'whitelist', 0)
    expect(tierStore.whitelistAddressAlreadyAdded(0, '0x1293871293872148623495781263489713264782')).toBe(false)
  })
})
