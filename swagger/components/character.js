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
    royalHouse: {
      description: "This house's royal house.",
      $ref: "#/components/schemas/House"
    },
    allegiances: {
      description: "This house's allegiances.",
      type: "array",
      items: {
        $ref: "#/components/schemas/House"
      }
    },
    father: {
      description: "This character's father.",
      type: "object",
      properties: {
        key: {
          type: "string"
        },
        name: {
          type: "string"
        },
        imageUrl: {
          type: "string"
        }
      }
    },
    mother: {
      description: "This character's mother.",
      type: "object",
      properties: {
        key: {
          type: "string"
        },
        name: {
          type: "string"
        },
        imageUrl: {
          type: "string"
        }
      }
    },
    spouse: {
      description: "This character's spouse.",
      type: "object",
      properties: {
        key: {
          type: "string"
        },
        name: {
          type: "string"
        },
        imageUrl: {
          type: "string"
        }
      }
    },
    childrens: {
      description: "This character's childrens.",
      type: "array",
      items: {
        type: "object",
        properties: {
          key: {
            type: "string"
          },
          name: {
            type: "string"
          },
          imageUrl: {
            type: "string"
          }
        }
      }
    },
  }
};

module.exports = Character;
