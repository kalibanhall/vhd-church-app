import 'package:flutter_test/flutter_test.dart';
import 'package:vhd_church_app/main.dart';

void main() {
  testWidgets('App should start without errors', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the app starts without errors
    expect(find.byType(MyApp), findsOneWidget);
  });
}
