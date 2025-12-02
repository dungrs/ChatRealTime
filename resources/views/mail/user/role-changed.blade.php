<x-mail::message>
    # Hello {{ $user->name }},

    @if ($user->is_admin)
        You are now an admin in the system. You can add and block users.
    @else
        Your role has been changed to a regular user.
        You are no longer able to add or block users.
    @endif

    Thanks,
    {{ config('app.name') }}
</x-mail::message>
