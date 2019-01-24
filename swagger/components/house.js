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
      seats: {
        type: "string"
      },
      founder: {
        type: "string"
      },
      founded: {
        type: "string"
      },
      region: {
        type: "string"
      },
      lordKey: {
        description: "This key character's lord.",
        type: "string"
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
  