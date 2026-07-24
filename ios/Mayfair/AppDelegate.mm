#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <ReactCommon/RCTTurboModule.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Mayfair";
  self.initialProps = @{};
  self.dependencyProvider = [RCTAppDependencyProvider new];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (id<RCTModuleProvider>)getModuleProvider:(const char *)name {
  // Try the standard dependency provider chain first
  id<RCTModuleProvider> provider = [super getModuleProvider:name];
  if (provider != nil) {
    return provider;
  }
  // Direct fallback: look up from dependency provider by name
  NSString *moduleName = [NSString stringWithCString:name encoding:NSUTF8StringEncoding];
  NSDictionary *providers = [self.dependencyProvider moduleProviders];
  id<RCTModuleProvider> directProvider = providers[moduleName];
  if (directProvider != nil) {
    return directProvider;
  }
  // Last resort: manually handle known modules
  if ([moduleName isEqualToString:@"OneSignal"]) {
    Class klass = NSClassFromString(@"RCTOneSignalEventEmitter");
    if (klass != nil) {
      return [klass new];
    }
  }
  return nil;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
