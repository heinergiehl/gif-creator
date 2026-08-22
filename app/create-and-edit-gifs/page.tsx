import { permanentRedirect } from 'next/navigation';

export default function CreateAndEditGifsRedirect() {
  permanentRedirect('/edit-gifs');
}
