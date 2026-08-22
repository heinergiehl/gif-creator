import { permanentRedirect } from 'next/navigation';

export default function CreateAndEditGifsEditorRedirect() {
  permanentRedirect('/edit-gifs/converter-and-editor/editor');
}
