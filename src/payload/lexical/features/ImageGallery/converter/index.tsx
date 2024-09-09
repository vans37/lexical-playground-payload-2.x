import { type HTMLConverter, convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'
import type { SerializedGalleryNode } from '../nodes/GalleryNode'
import { GalleryNode } from '../nodes/GalleryNode'
import type { SerializedGalleryImageNode } from '../nodes/GalleryImageNode'
import { GalleryImageNode } from '../nodes/GalleryImageNode'
import { replaceOriginWithServerUrl } from '../../../../utilities/utils'


const modalCode = `
  <div id="gallery-image-modal" style="
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    justify-content: center;
    align-items: center;"
    >
    <button id="close-gallery-image-modal" style="
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      font-size: 24px;
      color: white;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    ">&times;</button>
    <img id="modal-image" src="" alt="Modal Image" style="
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
    ">
  </div>
  <script>
    (function() {
      var modal = document.getElementById('gallery-image-modal');
      var modalImage = document.getElementById('modal-image');
      var closeBtn = document.getElementById('close-gallery-image-modal');

      document.querySelectorAll('.gallery-image').forEach(function(image) {
        image.addEventListener('click', function() {
          modal.style.display = 'flex';
          modalImage.src = this.src;
        });
      });

      closeBtn.onclick = function() {
        modal.style.display = 'none';
      };

      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = 'none';
        }
      };
    })();
  </script>
`;

export const GalleryConverter: HTMLConverter<SerializedGalleryNode> = {
  converter: async ({ converters, node, parent }) => {
    const children = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })

    const cols = node.columns || 3

    return `
            <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 8px;">
              ${children}
            </div>
            ${modalCode}`
  },
  nodeTypes: [GalleryNode.getType()],
}

export const GalleryImageConverter: HTMLConverter<SerializedGalleryImageNode> = {
  converter: ({ node }) => {
    const imgSrc = replaceOriginWithServerUrl(node.src)

    return String.raw`<div>
                        <img class='gallery-image' src='${imgSrc}' />
                      </div>`
  },
  nodeTypes: [GalleryImageNode.getType()],
}
