<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display settings page
     */
    public function index(): Response
    {
        return Inertia::render('Settings/Index');
    }
}
