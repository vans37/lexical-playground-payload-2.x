import type { HTMLConverter } from '@payloadcms/richtext-lexical'
import type { SerializedYouTubeNode } from '../nodes/YouTubeNode'
import { YouTubeNode } from '../nodes/YouTubeNode'

const YoutubeConverter: HTMLConverter<SerializedYouTubeNode> = {
  converter: async ({ node }: { node: SerializedYouTubeNode }) => {
    //https://www.w3schools.com/howto/howto_css_responsive_iframes.asp
    const html = String.raw`<p style="position: relative; overflow: hidden; padding-top: 56.25%;">
        <iframe style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%;" data-lexical-youtube="${node.videoID}"
        src="https://www.youtube-nocookie.com/embed/${node.videoID}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen="true"
        title="Youtube video"></iframe>
      </p>
      `
    return html
  },
  nodeTypes: [YouTubeNode.getType()],
}

export default YoutubeConverter
