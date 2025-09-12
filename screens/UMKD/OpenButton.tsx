import React from "react";
import { Button } from "react-native-paper";
import { openFile } from "../../utils/fileUtils";

type OpenButtonProps = {
  uri: string;
};

export const OpenButton = ({ uri }: OpenButtonProps) => (
  <Button
    mode="outlined"
    icon="folder-open"
    onPress={() => openFile(uri)}
    style={{ marginTop: 8 }}
  >
    Открыть файл
  </Button>
);
