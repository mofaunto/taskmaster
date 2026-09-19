import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import i18n from "@/i18n";
import { Attachment } from "@/types/task";
import { newId } from "@/utils/id";

const attachmentsDir = new Directory(Paths.document, "attachments");

async function saveAttachment(
  sourceUri: string,
  name: string,
  mimeType: string,
  kind: Attachment["kind"],
): Promise<Attachment> {
  attachmentsDir.create({ idempotent: true, intermediates: true });

  const id = newId();
  const target = new File(attachmentsDir, `${id}-${name}`);
  await new File(sourceUri).copy(target);

  return { id, uri: target.uri, name, mimeType, size: target.size, kind };
}

export async function takePhoto(): Promise<Attachment | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error(i18n.t("attachments.cameraDenied"));
  }

  const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  if (result.canceled) {
    return null;
  }

  const photo = result.assets[0];
  return saveAttachment(
    photo.uri,
    photo.fileName ?? `photo-${Date.now()}.jpg`,
    photo.mimeType ?? "image/jpeg",
    "image",
  );
}

export async function pickImage(): Promise<Attachment | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(i18n.t("attachments.photosDenied"));
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
  });
  if (result.canceled) {
    return null;
  }

  const image = result.assets[0];
  return saveAttachment(
    image.uri,
    image.fileName ?? `image-${Date.now()}.jpg`,
    image.mimeType ?? "image/jpeg",
    "image",
  );
}

export async function pickFile(): Promise<Attachment | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
  });
  if (result.canceled) {
    return null;
  }

  const file = result.assets[0];
  const mimeType = file.mimeType ?? "application/octet-stream";
  return saveAttachment(
    file.uri,
    file.name,
    mimeType,
    mimeType.startsWith("image/") ? "image" : "file",
  );
}

export function attachmentExists(attachment: Attachment) {
  try {
    return new File(attachment.uri).exists;
  } catch {
    return false;
  }
}

export function deleteAttachmentFile(attachment: Attachment) {
  try {
    const file = new File(attachment.uri);
    if (file.exists) {
      file.delete();
    }
  } catch (err) {
    console.error("Problem with deletion", err);
  }
}
