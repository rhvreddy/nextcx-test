import JsonEditor from './JsonEditorMain';
import { useState } from 'react';
export default function RenderJsonEditor() {
  const exampleData = {
    name: 'nvk',
    age: 20,
    images: ['file1.jpg', 'file2.jpg', ['file4.jpg', 'file5.jpg'], 'file3.jpg'],
    otherData: {
      name: 'nvk',
      age: 20,
      otherData: { name: 'nvk', age: 20, luckyNums: [1, 2, 3, 4] }
    }
  };

  const [data, setData] = useState({
    interpreterId: '100',
    startMessage: 'hii',
    button: [
      { title: 'Existing transfer ', dialogId: 'existing_transfer' },
      { title: 'General Inquiry ', dialogId: 'general_inquiry' }
    ]
  });

  return (
    <>
      <JsonEditor data={data} getResponse={setData} />
    </>
  );
}
