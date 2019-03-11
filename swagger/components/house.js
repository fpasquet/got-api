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
      lord: {
        description: "This character's lord.",
        $ref: "#/components/schemas/Character"
      },
      heirsKey: {
        description: "This character's heirs.",
        type: "array",
        items: {
          $ref: "#/components/schemas/Character"
        }
      },
    }
  };
  
  module.exports = Character;
  