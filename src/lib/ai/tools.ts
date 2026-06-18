export const IRIS_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "generate_image",
      description:
        "Generate a new image from a creative prompt. Use when the user wants to create visual art, posters, logos, or illustrations.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Detailed image generation prompt.",
          },
          style: {
            type: "string",
            enum: ["photorealistic", "illustration", "minimal", "cinematic", "abstract"],
            description: "Visual style direction.",
          },
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "edit_image",
      description:
        "Edit or transform an existing image based on user instructions. Use when the user wants to modify, inpaint, or restyle a visual.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Edit instructions.",
          },
          strength: {
            type: "number",
            description: "Edit strength from 0.1 to 1.0.",
          },
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "describe_scene",
      description:
        "Analyze the current vision frame and describe what is visible. Use when the user asks about what you see.",
      parameters: {
        type: "object",
        properties: {
          focus: {
            type: "string",
            description: "What aspect to focus on: composition, colors, subjects, lighting.",
          },
        },
      },
    },
  },
];

export type IrisToolName = "generate_image" | "edit_image" | "describe_scene";
