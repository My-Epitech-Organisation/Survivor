import React from "react";
import { Image, View } from "@react-pdf/renderer";

interface AccessibleImageProps {
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any;
  description: string;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  source,
  style,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description: _description,
}) => {
  return (
    <View>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image source={source} style={style} aria-hidden="false" />
    </View>
  );
};
