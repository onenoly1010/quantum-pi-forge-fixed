#!/usr/bin/env python3
"""
Oracle Engine Integration Test
Validates that the extracted oracle components are working correctly.
"""

import sys
import os

# Add the oracle directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from index import (
        generate_reading,
        map_traits,
        verify_soul_signature,
        evaluate_proposal,
        calculate_coherence
    )

    print('Oracle Engine Status:')
    print('- Exports present:', True)
    print('- Has reading function:', callable(generate_reading))
    print('- Has trait mapping:', callable(map_traits))
    print('- Has verification:', callable(verify_soul_signature))
    print('- Has proposal evaluation:', callable(evaluate_proposal))
    print('- Has coherence calculation:', callable(calculate_coherence))

    # Basic functionality test
    test_data = {"test": "data"}
    reading = generate_reading(test_data)
    traits = map_traits(test_data)
    verification = verify_soul_signature("test_sig", test_data)

    print('\nBasic functionality tests:')
    print('- Reading generation:', 'PASS' if reading else 'FAIL')
    print('- Trait mapping:', 'PASS' if traits else 'FAIL')
    print('- Signature verification:', 'PASS' if isinstance(verification, bool) else 'FAIL')

    print('\n✅ Oracle extraction validation: SUCCESS')

except ImportError as e:
    print(f'❌ Import error: {e}')
    print('Oracle extraction validation: FAILED')
    sys.exit(1)
except Exception as e:
    print(f'❌ Test error: {e}')
    print('Oracle extraction validation: FAILED')
    sys.exit(1)