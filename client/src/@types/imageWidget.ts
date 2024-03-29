export type ImageWidgetValue = {
  value: string | null;
  image: string | null;
  title: string | null;
};

export type ImageWidgetProps = {
  deviceId: number | null;
  tagId: number | null;
  imageValues: ImageWidgetValue[];
};
