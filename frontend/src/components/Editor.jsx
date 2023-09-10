// import { BlockNoteEditor } from '@blocknote/core';
import {
  BlockNoteView,
  lightDefaultTheme,
  useBlockNote,
} from '@blocknote/react';
import '@blocknote/core/style.css';

const defaultContent = [
  {
    id: 'd78b8f70-f722-4e57-8295-031370ede71d',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: '1',
    },
    content: [
      {
        type: 'text',
        text: 'Heading',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '66bf374f-ddf9-4507-8ee3-3aaf9a0f6c3d',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: '2',
    },
    content: [
      {
        type: 'text',
        text: 'Heading 2',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '68b3b0c0-eeab-4cd2-87bb-f24cd71b0070',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: '3',
    },
    content: [
      {
        type: 'text',
        text: 'Heading 3',
        styles: {},
      },
    ],
    children: [],
  },
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
  {
    id: '86eaae4b-8f76-4726-b6c5-e6317d70fbde',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Bullet list item 1',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '93413c15-16dd-44d1-8c09-e2f32914be88',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Bullet list item 2',
        styles: {},
      },
    ],
    children: [
      {
        id: 'e30e1406-78e5-48e7-b94a-ca014d8917de',
        type: 'bulletListItem',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'Nested bullet tier 1',
            styles: {},
          },
        ],
        children: [
          {
            id: '75597ca6-10de-4acb-bd74-b596d6b067d4',
            type: 'bulletListItem',
            props: {
              textColor: 'default',
              backgroundColor: 'default',
              textAlignment: 'left',
            },
            content: [
              {
                type: 'text',
                text: 'Nested bullet tier 2',
                styles: {},
              },
            ],
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: '1e4d5d0b-cdad-442e-ae87-f57308e1d330',
    type: 'numberedListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Numbered list item 1',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '1a7d40ff-3498-41cb-b807-5da9f3ed7f7a',
    type: 'numberedListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Numbered list item 2',
        styles: {},
      },
    ],
    children: [
      {
        id: '1c2c80f5-0416-4c73-95aa-f0d21a11e2a6',
        type: 'numberedListItem',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'Nested numbered list tier 1',
            styles: {},
          },
        ],
        children: [
          {
            id: 'c17624a6-6945-49ba-ad59-2b1f72cd31a9',
            type: 'numberedListItem',
            props: {
              textColor: 'default',
              backgroundColor: 'default',
              textAlignment: 'left',
            },
            content: [
              {
                type: 'text',
                text: 'Nested numbered list tier 2',
                styles: {},
              },
            ],
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: '3ef9e9f2-f3a2-4fcf-a152-dffcb4accb1d',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Inline text styles → ',
        styles: {},
      },
      {
        type: 'text',
        text: 'coloured text',
        styles: {
          textColor: 'red',
        },
      },
      {
        type: 'text',
        text: '  ',
        styles: {},
      },
      {
        type: 'text',
        text: 'italics  ',
        styles: {
          italic: true,
        },
      },
      {
        type: 'text',
        text: 'bold  ',
        styles: {
          bold: true,
        },
      },
      {
        type: 'text',
        text: 'underline',
        styles: {
          underline: true,
        },
      },
      {
        type: 'text',
        text: '  ',
        styles: {},
      },
      {
        type: 'text',
        text: 'strikethrough',
        styles: {
          strike: true,
        },
      },
      {
        type: 'text',
        text: '  ',
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: 'be9d2fe3-1c77-4967-aee5-3a766cd5ee38',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: '3',
    },
    content: [
      {
        type: 'text',
        text: 'Text alignment',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '1befbd8d-f20d-4c42-acd2-0df38a362719',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Left align (default)',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '07ad2a0b-b65e-4c39-aee2-39928133e933',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'center',
    },
    content: [
      {
        type: 'text',
        text: 'Center align',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'f6efe293-0fdc-416e-830b-5e9b818f24e9',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'right',
    },
    content: [
      {
        type: 'text',
        text: 'Right align',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'af34c791-8e7b-46ae-be4b-a1eca0450b96',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Raw Link:',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '637306a2-2841-486f-ab78-5400bd2d4a1e',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'link',
        href: ' https://unsplash.it/500/500',
        content: [
          {
            type: 'text',
            text: 'https://unsplash.it/500/500',
            styles: {},
          },
        ],
      },
    ],
    children: [],
  },
  {
    id: '1d53fa67-92e2-4e3c-8e80-b4742a4478d5',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Link with display text:',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '8e3a5f07-d9d7-4e33-bb4b-402269c4fe73',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'link',
        href: ' https://unsplash.it/500/500',
        content: [
          {
            type: 'text',
            text: 'Random 500 x 500 image from Unsplash API',
            styles: {},
          },
        ],
      },
    ],
    children: [],
  },
  {
    id: '6a8dc313-f848-4b11-a846-827d806170f3',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [],
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
      boxShadow: `0 4px 12px ${theme.colors.shadow}`,
      padding: `20px 0px`,
    },
  }),
};

const Editor = () => {
  const editor = useBlockNote({
    initialContent: defaultContent,
  });
  editor.onEditorContentChange(() => {
    // Get and log all top-level, i.e. non-nested blocks in the editor.
    const blocks = editor.topLevelBlocks;
    console.table(blocks);
  });

  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} theme={theme} />;
};
export default Editor;
