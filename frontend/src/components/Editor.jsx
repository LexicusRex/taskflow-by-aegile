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
      // margin: '0 50px',
      border: `1px solid ${theme.colors.border}`,
      // boxShadow: `0 3px 3px ${theme.colors.shadow}`,
      padding: `20px 0px`,
    },
  }),
};

// The custom schema, which includes the default blocks and the custom image
// block.
const customSchema = {
  // Adds all default blocks.
  ...defaultBlockSchema,
  // Adds the custom image block.
  // image: ImageBlockWrapper,
};

const Editor = ({ initialBlocks, taskId }) => {
  let timeoutId;
  const editor = useBlockNote({
    initialContent: initialBlocks.length > 0 ? initialBlocks : placeholder,
    blockSchema: customSchema,
    slashMenuItems: [...getDefaultReactSlashMenuItems(customSchema)],
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
