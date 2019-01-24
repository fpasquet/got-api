const Character = {
  properties: {
    key: {
      type: "string"
    },
    name: {
      type: "string"
    },
    imageUrl: {
      type: "string"
    },
    culture: {
      type: "string"
    },
    race: {
      type: "string"
    },
    titles: {
      type: "array",
      items: {
        type: "string"
      }
    },
    royalHouseKey: {
      description: "This key house's royal house.",
      type: "string"
    },
    allegiancesKey: {
      description: "This keys house's allegiances.",
      type: "array",
      items: {
        type: "string"
      }
    },
    fatherKey: {
      description: "This key character's father.",
      type: "string"
    },
    motherKey: {
      description: "This key character's mother.",
      type: "string"
    },
    spouseKey: {
      description: "This key character's spouse.",
      type: "string"
    },
    queenKey: {
      description: "This key character's queen.",
      type: "string"
    },
    childrensKey: {
      description: "This keys character's childrens.",
      type: "array",
      items: {
        type: "string"
      }
    },
    heirsKey: {
      description: "This keys character's heirs.",
      type: "array",
      items: {
        type: "string"
      }
    },
  }
};

module.exports = Character;
