#!/usr/bin/env python3
"""
Simple runner script for Sahadan scraper
"""

import sys
import os

def check_requirements():
    """Check if required packages are installed"""
    required_packages = ['selenium', 'beautifulsoup4', 'pandas', 'requests']
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print("❌ Missing required packages:")
        for pkg in missing:
            print(f"   - {pkg}")
        print("\n💡 Install with: pip install -r requirements.txt")
        return False
    
    return True

def main():
    """Main runner function"""
    print("🔍 Sahadan Web Scraper")
    print("=" * 30)
    
    if not check_requirements():
        sys.exit(1)
    
    print("\nSelect scraper type:")
    print("1. Basic Scraper (sahadan_scraper.py)")
    print("2. Advanced Scraper (advanced_scraper.py)")
    print("3. Exit")
    
    try:
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == '1':
            print("\n🚀 Running Basic Scraper...")
            from sahadan_scraper import main as run_basic
            run_basic()
            
        elif choice == '2':
            print("\n🚀 Running Advanced Scraper...")
            from advanced_scraper import run_advanced_scraper
            run_advanced_scraper()
            
        elif choice == '3':
            print("👋 Goodbye!")
            
        else:
            print("❌ Invalid choice")
    
    except KeyboardInterrupt:
        print("\n⏹️ Interrupted by user")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()