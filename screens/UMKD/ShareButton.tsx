import React from "react";
import { Button } from "react-native-paper";
import { shareFile } from "../../utils/fileUtils";

type ShareButtonProps = {
  uri: string;
};

export const ShareButton = ({ uri }: ShareButtonProps) => (
  <Button
    mode="outlined"
    icon="share-variant"
    onPress={() => shareFile(uri)}
    style={{ marginTop: 8, marginLeft: 8 }}
  >
    Поделиться
  </Button>
);
