/*
TODO: THIS IS REALLY BAD
This is an attempt at fixing Facebook's inconsistencies. Sometimes they give us
two attachment objects, but sometimes only one. They each contain part of the
data that you'd want so we merge them for convenience.
Instead of having a bunch of if statements guarding every access to image_data,
we set it to empty object and use the fact that it'll return undefined.
*/
export function _formatAttachment(attachment1: any, attachment2?: any) {
     attachment1 = attachment1.mercury ? attachment1.mercury : attachment1;
     attachment2 = attachment2 || { id: "", image_data: {} };
     let blob = attachment1.blob_attachment, type = blob && blob.__typename ? blob.__typename : attachment1.attach_type;
     if (!type && attachment1.sticker_attachment) {
          type = "StickerAttachment";
          blob = attachment1.sticker_attachment;
     } else if (!type && attachment1.extensible_attachment) {
          type = "ExtensibleAttachment";
          blob = attachment1.extensible_attachment;
     }
     // TODO: Determine whether "sticker", "photo", "file" etc are still used
     // KEEP IN SYNC WITH getThreadHistory
     switch (type) {
          case "sticker":
               return {
                    type: "sticker",
                    ID: attachment1.metadata.stickerID.toString(),
                    url: attachment1.url,

                    packID: attachment1.metadata.packID.toString(),
                    spriteUrl: attachment1.metadata.spriteURI,
                    spriteUrl2x: attachment1.metadata.spriteURI2x,
                    width: attachment1.metadata.width,
                    height: attachment1.metadata.height,

                    caption: attachment2.caption,
                    description: attachment2.description,

                    frameCount: attachment1.metadata.frameCount,
                    frameRate: attachment1.metadata.frameRate,
                    framesPerRow: attachment1.metadata.framesPerRow,
                    framesPerCol: attachment1.metadata.framesPerCol,

                    stickerID: attachment1.metadata.stickerID.toString(), // @Legacy
                    spriteURI: attachment1.metadata.spriteURI, // @Legacy
                    spriteURI2x: attachment1.metadata.spriteURI2x // @Legacy
               };
          case "file":
               return {
                    type: "file",
                    filename: attachment1.name,
                    ID: attachment2.id.toString(),
                    url: attachment1.url,

                    isMalicious: attachment2.is_malicious,
                    contentType: attachment2.mime_type,

                    name: attachment1.name, // @Legacy
                    mimeType: attachment2.mime_type, // @Legacy
                    fileSize: attachment2.file_size // @Legacy
               };
          case "photo":
               return {
                    type: "photo",
                    ID: attachment1.metadata.fbid.toString(),
                    filename: attachment1.fileName,
                    thumbnailUrl: attachment1.thumbnail_url,

                    previewUrl: attachment1.preview_url,
                    previewWidth: attachment1.preview_width,
                    previewHeight: attachment1.preview_height,

                    largePreviewUrl: attachment1.large_preview_url,
                    largePreviewWidth: attachment1.large_preview_width,
                    largePreviewHeight: attachment1.large_preview_height,

                    url: attachment1.metadata.url, // @Legacy
                    width: attachment1.metadata.dimensions.split(",")[0], // @Legacy
                    height: attachment1.metadata.dimensions.split(",")[1], // @Legacy
                    name: attachment1.fileName // @Legacy
               };
          case "animated_image":
               return {
                    type: "animated_image",
                    ID: attachment2.id.toString(),
                    filename: attachment2.filename,

                    previewUrl: attachment1.preview_url,
                    previewWidth: attachment1.preview_width,
                    previewHeight: attachment1.preview_height,

                    url: attachment2.image_data.url,
                    width: attachment2.image_data.width,
                    height: attachment2.image_data.height,

                    name: attachment1.name, // @Legacy
                    facebookUrl: attachment1.url, // @Legacy
                    thumbnailUrl: attachment1.thumbnail_url, // @Legacy
                    mimeType: attachment2.mime_type, // @Legacy
                    rawGifImage: attachment2.image_data.raw_gif_image, // @Legacy
                    rawWebpImage: attachment2.image_data.raw_webp_image, // @Legacy
                    animatedGifUrl: attachment2.image_data.animated_gif_url, // @Legacy
                    animatedGifPreviewUrl: attachment2.image_data.animated_gif_preview_url, // @Legacy
                    animatedWebpUrl: attachment2.image_data.animated_webp_url, // @Legacy
                    animatedWebpPreviewUrl: attachment2.image_data.animated_webp_preview_url // @Legacy
               };
          case "share":
               return {
                    type: "share",
                    ID: attachment1.share.share_id.toString(),
                    url: attachment2.href,

                    title: attachment1.share.title,
                    description: attachment1.share.description,
                    source: attachment1.share.source,

                    image: attachment1.share.media.image,
                    width: attachment1.share.media.image_size.width,
                    height: attachment1.share.media.image_size.height,
                    playable: attachment1.share.media.playable,
                    duration: attachment1.share.media.duration,

                    subattachments: attachment1.share.subattachments,
                    properties: {},

                    animatedImageSize: attachment1.share.media.animated_image_size, // @Legacy
                    facebookUrl: attachment1.share.uri, // @Legacy
                    target: attachment1.share.target, // @Legacy
                    styleList: attachment1.share.style_list // @Legacy
               };
          case "video":
               return {
                    type: "video",
                    ID: attachment1.metadata.fbid.toString(),
                    filename: attachment1.name,

                    previewUrl: attachment1.preview_url,
                    previewWidth: attachment1.preview_width,
                    previewHeight: attachment1.preview_height,

                    url: attachment1.url,
                    width: attachment1.metadata.dimensions.width,
                    height: attachment1.metadata.dimensions.height,

                    duration: attachment1.metadata.duration,
                    videoType: "unknown",

                    thumbnailUrl: attachment1.thumbnail_url // @Legacy
               };
          case "error":
               return {
                    type: "error",

                    // Save error attachments because we're unsure of their format,
                    // and whether there are cases they contain something useful for debugging.
                    attachment1: attachment1,
                    attachment2: attachment2
               };
          case "MessageImage":
               return {
                    type: "photo",
                    ID: blob.legacy_attachment_id,
                    filename: blob.filename,
                    thumbnailUrl: blob.thumbnail.uri,

                    previewUrl: blob.preview.uri,
                    previewWidth: blob.preview.width,
                    previewHeight: blob.preview.height,

                    largePreviewUrl: blob.large_preview.uri,
                    largePreviewWidth: blob.large_preview.width,
                    largePreviewHeight: blob.large_preview.height,

                    url: blob.large_preview.uri, // @Legacy
                    width: blob.original_dimensions.x, // @Legacy
                    height: blob.original_dimensions.y, // @Legacy
                    name: blob.filename // @Legacy
               };
          case "MessageAnimatedImage":
               return {
                    type: "animated_image",
                    ID: blob.legacy_attachment_id,
                    filename: blob.filename,

                    previewUrl: blob.preview_image.uri,
                    previewWidth: blob.preview_image.width,
                    previewHeight: blob.preview_image.height,

                    url: blob.animated_image.uri,
                    width: blob.animated_image.width,
                    height: blob.animated_image.height,

                    thumbnailUrl: blob.preview_image.uri, // @Legacy
                    name: blob.filename, // @Legacy
                    facebookUrl: blob.animated_image.uri, // @Legacy
                    rawGifImage: blob.animated_image.uri, // @Legacy
                    animatedGifUrl: blob.animated_image.uri, // @Legacy
                    animatedGifPreviewUrl: blob.preview_image.uri, // @Legacy
                    animatedWebpUrl: blob.animated_image.uri, // @Legacy
                    animatedWebpPreviewUrl: blob.preview_image.uri // @Legacy
               };
          case "MessageVideo":
               return {
                    type: "video",
                    filename: blob.filename,
                    ID: blob.legacy_attachment_id,

                    previewUrl: blob.large_image.uri,
                    previewWidth: blob.large_image.width,
                    previewHeight: blob.large_image.height,

                    url: blob.playable_url,
                    width: blob.original_dimensions.x,
                    height: blob.original_dimensions.y,

                    duration: blob.playable_duration_in_ms,
                    videoType: blob.video_type.toLowerCase(),

                    thumbnailUrl: blob.large_image.uri // @Legacy
               };
          case "MessageAudio":
               return {
                    type: "audio",
                    filename: blob.filename,
                    ID: blob.url_shimhash,

                    audioType: blob.audio_type,
                    duration: blob.playable_duration_in_ms,
                    url: blob.playable_url,

                    isVoiceMail: blob.is_voicemail
               };
          case "StickerAttachment":
               return {
                    type: "sticker",
                    ID: blob.id,
                    url: blob.url,

                    packID: blob.pack
                         ? blob.pack.id
                         : null,
                    spriteUrl: blob.sprite_image,
                    spriteUrl2x: blob.sprite_image_2x,
                    width: blob.width,
                    height: blob.height,

                    caption: blob.label,
                    description: blob.label,

                    frameCount: blob.frame_count,
                    frameRate: blob.frame_rate,
                    framesPerRow: blob.frames_per_row,
                    framesPerCol: blob.frames_per_column,

                    stickerID: blob.id, // @Legacy
                    spriteURI: blob.sprite_image, // @Legacy
                    spriteURI2x: blob.sprite_image_2x // @Legacy
               };
          case "ExtensibleAttachment":
               return {
                    type: "share",
                    ID: blob.legacy_attachment_id,
                    url: blob.story_attachment.url,

                    title: blob.story_attachment.title_with_entities.text,
                    description:
                         blob.story_attachment.description &&
                         blob.story_attachment.description.text,
                    source: blob.story_attachment.source
                         ? blob.story_attachment.source.text
                         : null,

                    image:
                         blob.story_attachment.media &&
                         blob.story_attachment.media.image &&
                         blob.story_attachment.media.image.uri,
                    width:
                         blob.story_attachment.media &&
                         blob.story_attachment.media.image &&
                         blob.story_attachment.media.image.width,
                    height:
                         blob.story_attachment.media &&
                         blob.story_attachment.media.image &&
                         blob.story_attachment.media.image.height,
                    playable:
                         blob.story_attachment.media &&
                         blob.story_attachment.media.is_playable,
                    duration:
                         blob.story_attachment.media &&
                         blob.story_attachment.media.playable_duration_in_ms,
                    playableUrl:
                         blob.story_attachment.media == null
                              ? null
                              : blob.story_attachment.media.playable_url,

                    subattachments: blob.story_attachment.subattachments,
                    properties: blob.story_attachment.properties.reduce(function (obj, cur) {
                         obj[cur.key] = cur.value.text;
                         return obj;
                    }, {}),

                    facebookUrl: blob.story_attachment.url, // @Legacy
                    target: blob.story_attachment.target, // @Legacy
                    styleList: blob.story_attachment.style_list // @Legacy
               };
          case "MessageFile":
               return {
                    type: "file",
                    filename: blob.filename,
                    ID: blob.message_file_fbid,

                    url: blob.url,
                    isMalicious: blob.is_malicious,
                    contentType: blob.content_type,

                    name: blob.filename,
                    mimeType: "",
                    fileSize: -1
               };
          default:
               throw new Error(
                    "unrecognized attach_file of type " +
                    type +
                    "`" +
                    JSON.stringify(attachment1, null, 4) +
                    " attachment2: " +
                    JSON.stringify(attachment2, null, 4) +
                    "`"
               );
     }
}

export default function formatAttachment(attachments: any[], attachmentIds: string[], attachmentMap: Map<string, any>, shareMap: Map<string, any>) {
     attachmentMap = shareMap || attachmentMap;
     return attachments
          ? attachments.map(function (val, i) {
               if (
                    !attachmentMap ||
                    !attachmentIds ||
                    !attachmentMap[attachmentIds[i]]
               ) {
                    return _formatAttachment(val);
               }
               return _formatAttachment(val, attachmentMap[attachmentIds[i]]);
          })
          : [];
}