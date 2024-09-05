import { HTMLConverterFeature } from '@payloadcms/richtext-lexical'
import { DragDropPasteFeature } from '../DragDropPaste'
import { ImagesFeature } from '../Images'
import { TableFeature } from '../Table'
import { TableActionMenuFeature } from '../TableActionMenu'
import { TableCellResizerFeature } from '../TableCellResizer'
import { ParagraphConverter } from '../Paragraph/converter'
import { YoutubeFeature } from '../Youtube'
import { LayoutFeature } from '../Layout'
import { TextBackgroundFeature } from '../TextStyles/BackgroundColor'
import { TextColorFeature } from '../TextStyles/TextColor'
import { ClearFormattingFeature } from '../TextStyles/ClearFormatting'
import { ToolbarFeature } from '../Toolbar'
import '../../lib/index.scss'
import { CollapsibleFeature } from '../Collapsible'
import { CommentsFeature } from '../Comments'
import { ActionsFeature } from '../Actions'
import { ContextMenuFeature } from '../ContextMenu'
import { TextHTMLConverter } from '../Text/converter'
import { GalleryFeature } from '../ImageGallery'

/* 
  some of the adjastments and extensions(mainly adapted from lexical playground, so styles, theming is not respected at the moment):
  1. Images
    Drag and drop images into the editor.
    Paste images from clipboard.
    Resize images.
    Add captions.
    Autoupload images to media collection(field hook).
  2. Tables:
    Added support for tables.
    Ability to resize table cells.
    Action menu for table(add/delete rows, columns, background colors etc.).
    Each table cell can convert default lexical features(paragraph, image etc.) into 
    html, except relationship feature (how to go about that? what even should be rendered as html?).

  3. HtmlConverterFeature
    Links
      Pass linkConverterSettings to override default origin (https://) with custom one
      to be able to construct custom links to internal documents.
      e.g /products/{slug}
      Please note that you shouldn't delete https:// in your admin panel, when 
      constructing custom link because it will fail validation. (to bypass it you need to build custom editor from payload's source code)
      It is needed if only you use converted html in your frontend,
      otherwise you can parse editor state coming via api and just use 
      regular internal link to collection.
    Paragraph
      Paragraph now respects alignment style (left, right, center, justify).
  4. Youtube Feature 

*/

export type QOLFeaturesType = {
  images: {
    origin: string
  }
}

export const QOLFeatures = ({ images }: QOLFeaturesType) => {
  return [
    ActionsFeature(),
    ToolbarFeature(),
    CommentsFeature(),
    ContextMenuFeature(),
    DragDropPasteFeature(),
    TableCellResizerFeature(),
    TableFeature(),
    CollapsibleFeature(),
    TableActionMenuFeature(),
    ImagesFeature({
      origin: images.origin,
    }),
    GalleryFeature(),
    YoutubeFeature(),
    LayoutFeature(),
    TextBackgroundFeature(),
    TextColorFeature(),
    ClearFormattingFeature(),
    HTMLConverterFeature({
      converters: ({ defaultConverters }) => {
        const filtered = defaultConverters.filter(converter => {
          return !converter.nodeTypes.includes('text') && !converter.nodeTypes.includes('paragraph')
        })
        return [...filtered, ParagraphConverter, TextHTMLConverter]
      },
    }),
  ]
}
