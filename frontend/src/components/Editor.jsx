// import { BlockNoteEditor } from '@blocknote/core';
import {
  BlockNoteView,
  lightDefaultTheme,
  useBlockNote,
  createReactBlockSpec,
  InlineContent,
  getDefaultReactSlashMenuItems,
  ReactSlashMenuItem,
} from '@blocknote/react';
import {
  BlockNoteEditor,
  BlockSchema,
  DefaultBlockSchema,
  defaultBlockSchema,
  defaultProps,
} from '@blocknote/core';
import '@blocknote/core/style.css';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { fetchAPIRequest } from '../helpers';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useState } from 'react';
import ImageUploadBtn from './ImageUploadBtn';
const placeholder = [
  {
    id: 'f3619d66-662d-4760-bff2-2c0657eefbe9',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'This is a paragraph block.',
        styles: {},
      },
    ],
    children: [],
  },
];

// Default dark theme with additional component styles.
const theme = {
  ...lightDefaultTheme,
  componentStyles: (theme) => ({
    // Adds basic styling to the editor.
    Editor: {
      backgroundColor: theme.colors.editor.background,
      borderRadius: '10px',
      margin: '0 50px',
      border: `1px solid ${theme.colors.border}`,
      // boxShadow: `0 3px 3px ${theme.colors.shadow}`,
      padding: `20px 0px`,
    },
  }),
};

const ImageBlockWrapper = createReactBlockSpec({
  type: 'image',
  propSchema: {
    ...defaultProps,
    src: {
      default: 'https://via.placeholder.com/1000',
    },
    alt: {
      default: 'image',
    },
  },
  containsInlineContent: false,
  render: ({ block }) => {
    return (
      <div
        id="image-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          src={block.props.src}
          alt={block.props.alt}
          contentEditable={false}
          style={{
            display: block.props.src ? 'block' : 'none',
            maxWidth: '100%',
          }}
        />
        <div
          style={{
            display: block.props.src ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextField
            label="Image Embed URL"
            size="small"
            onChange={(e) => (block.props.src = e.target.value)}
          />
          <div style={{ padding: '0 10px' }}>or</div>
          <ImageUploadBtn
            callback={(src) => (block.props.src = src)}
            compressedCallback={() => {}}
            btnText={'Upload Image'}
          />
        </div>
        <div style={{ display: block.props.src ? 'none' : 'block' }}>
          Click to another block to render image.
        </div>
      </div>
    );
  },
});

// The custom schema, which includes the default blocks and the custom image
// block.
const customSchema = {
  // Adds all default blocks.
  ...defaultBlockSchema,
  // Adds the custom image block.
  image: ImageBlockWrapper,
};

// Creates a slash menu item for inserting an image block.
const insertImage = {
  name: 'Insert Image',
  execute: (editor) => {
    // const src = prompt('Enter image URL');
    // const alt = prompt("Enter image alt text");
    const src = '';
    const alt = 'image';
    editor.getTextCursorPosition().block.content.text = '---';
    editor.insertBlocks(
      [
        {
          type: 'image',
          props: {
            src: src || '',
            alt: alt || 'image',
          },
        },
      ],
      editor.getTextCursorPosition().block,
      'before'
    );
  },
  aliases: ['image', 'img', 'picture', 'media'],
  group: 'Media',
  icon: <ImageOutlinedIcon />,
  hint: 'Insert an image',
};

const Editor = ({ initialBlocks, taskId }) => {
  let timeoutId;
  const editor = useBlockNote({
    initialContent: initialBlocks.length > 0 ? initialBlocks : placeholder,
    blockSchema: customSchema,
    slashMenuItems: [
      ...getDefaultReactSlashMenuItems(customSchema),
      insertImage,
    ],
  });
  editor.onEditorContentChange(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      console.log('saving...');
      const blocks = editor.topLevelBlocks;
      await fetchAPIRequest(`/task/edit/content?taskId=${taskId}`, 'PUT', {
        blocks,
      });
    }, 5000);

    // console.table(blocks);
  });

  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} theme={theme} />;
};
export default Editor;
