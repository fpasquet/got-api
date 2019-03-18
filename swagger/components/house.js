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
    // seats: {
    //   type: "string"
    // },
    // founder: {
    //   description: "This character's founder.",
    //   $ref: "#/components/schemas/Character"
    // },
    // founded: {
    //   type: "string"
    // },
    // region: {
    //   type: "string"
    // },
    // lord: {
    //   description: "This character's lord.",
    //   $ref: "#/components/schemas/Character"
    // }
  }
};

module.exports = Character;
