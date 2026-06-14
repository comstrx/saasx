
{{-- <div class="w-full text-center">
    <img src="{{ $message->embed(public_path('media/logo.png')) }}" alt="Logo" style="width: 100px; height: 100%;">
</div> --}}

<p>Hi, {{ $user->name }}</p>

<p>{{ $data->title }}</p>

<p>{{ $data->content }}</p>

<a href="{{ $data->url }}">Browse Now</a>
