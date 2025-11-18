<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class MealDBProxyController extends Controller
{
    public function proxy($endpoint)
    {
        $url = "https://www.themealdb.com/api/json/v1/1/" . $endpoint;

        try {
            $response = Http::withHeaders([
                "Accept" => "application/json"
            ])->get($url);

            return $response->json();
        } catch (\Exception $e) {
            return response()->json(["error" => "Proxy Failed"], 500);
        }
    }
}
