<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ConnectionController extends Controller
{
    /**
     * Display a listing of WhatsApp instances
     */
    public function index(): Response
    {
        $instances = WhatsAppInstance::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Connections/Index', [
            'instances' => $instances,
        ]);
    }

    /**
     * Show the QR Code page for a specific instance
     */
    public function qrCode(string $token): Response
    {
        $instance = WhatsAppInstance::where('token', $token)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('Connections/QRCode', [
            'instance' => $instance,
        ]);
    }
}
