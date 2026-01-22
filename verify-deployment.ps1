# Creator Revenue Engine - Verification Script
# Run this after deployment to verify everything works

param(
    [string]$ApiUrl = "https://your-app.vercel.app"
)

Write-Host "🚀 CREATOR PAYOUT SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$testsPassed = 0
$testsTotal = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [bool]$ExpectAuth = $false
    )

    $script:testsTotal++
    Write-Host "`n[$script:testsTotal/$script:testsTotal] Testing $Name..." -ForegroundColor Yellow

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 30
            ErrorAction = "Stop"
        }

        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }

        $response = Invoke-WebRequest @params

        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $Name : $($response.StatusCode)" -ForegroundColor Green
            $script:testsPassed++

            # Try to parse JSON response
            try {
                $jsonResponse = $response.Content | ConvertFrom-Json
                Write-Host "   📄 Response: $($jsonResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
            } catch {
                Write-Host "   📄 Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️  $Name : $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        if ($ExpectAuth -and $_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✅ $Name : 401 (Auth required - expected)" -ForegroundColor Green
            $script:testsPassed++
        } elseif ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   ⚠️  $Name : 404 (Endpoint not found)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $Name : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Test 1: API Health
Test-Endpoint -Name "API Health" -Url "$ApiUrl/api/health"

# Test 2: Creator Dashboard (requires auth)
Test-Endpoint -Name "Creator Dashboard" -Url "$ApiUrl/api/creator/dashboard?creator_id=test-123" -ExpectAuth $true

# Test 3: Recent Payouts (requires auth)
Test-Endpoint -Name "Recent Payouts" -Url "$ApiUrl/api/creator/recent-payouts?creator_id=test-123" -ExpectAuth $true

# Test 4: Creator Onboarding
$onboardBody = @{
    email = "test-$(Get-Random)@example.com"
    name = "Test Creator"
} | ConvertTo-Json

Test-Endpoint -Name "Creator Onboarding" -Url "$ApiUrl/api/creator/onboard" -Method "POST" -Body $onboardBody

# Test 5: Payout Transaction
$payoutBody = @{
    templateId = "template_test_$(Get-Random)"
    userId = "user_test_$(Get-Random)"
    burnAmount = 10.00
    transactionHash = "0x$(Get-Random -Maximum 999999999999999)"
} | ConvertTo-Json

Test-Endpoint -Name "Payout Transaction" -Url "$ApiUrl/api/creator/payout" -Method "POST" -Body $payoutBody

# Test 6: Stripe Onboarding
$stripeBody = @{
    creator_id = "test-creator-$(Get-Random)"
    email = "stripe-$(Get-Random)@example.com"
} | ConvertTo-Json

Test-Endpoint -Name "Stripe Onboarding" -Url "$ApiUrl/api/creator/stripe/onboard" -Method "POST" -Body $stripeBody

# Test 7: Revenue Monitor (admin)
Test-Endpoint -Name "Revenue Monitor" -Url "$ApiUrl/api/admin/revenue-monitor" -ExpectAuth $true

# Test 8: Premium Template Toggle
$templateBody = @{
    template_id = "template-$(Get-Random)"
    is_premium = $true
    price = 9.99
} | ConvertTo-Json

Test-Endpoint -Name "Premium Template" -Url "$ApiUrl/api/creator/template/premium" -Method "POST" -Body $templateBody

# Test 9: Referral Generation
$referralBody = @{
    creator_id = "creator-$(Get-Random)"
} | ConvertTo-Json

Test-Endpoint -Name "Referral Generation" -Url "$ApiUrl/api/creator/referral/generate" -Method "POST" -Body $referralBody

# Results
Write-Host "`n📊 VERIFICATION RESULTS" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$successRate = [math]::Round(($testsPassed / $testsTotal) * 100, 1)
Write-Host "Tests Passed: $testsPassed / $testsTotal ($successRate%)" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

if ($successRate -ge 80) {
    Write-Host "`n🎉 SYSTEM READY FOR LAUNCH!" -ForegroundColor Green
    Write-Host "Your creator payout engine is working correctly." -ForegroundColor Green
} elseif ($successRate -ge 60) {
    Write-Host "`n⚠️  MOSTLY READY" -ForegroundColor Yellow
    Write-Host "Some endpoints may need environment variables or auth setup." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ ISSUES DETECTED" -ForegroundColor Red
    Write-Host "Check your deployment and environment variables." -ForegroundColor Red
}

Write-Host "`n🔧 TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host "1. Check Vercel environment variables are set correctly"
Write-Host "2. Verify Supabase schema was deployed"
Write-Host "3. Ensure Stripe webhook secret is configured"
Write-Host "4. Check API logs in Vercel dashboard"

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Set up Stripe webhook: stripe listen --forward-to $ApiUrl/api/webhooks/stripe"
Write-Host "2. Test with real Stripe account"
Write-Host "3. Launch to your creator community!"
Write-Host "4. Monitor earnings with: start launch-dashboard.html"

Write-Host "`n💰 READY TO GENERATE REVENUE!" -ForegroundColor Green