import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class UiHelpers {
  static void showSnackBar(
    BuildContext context,
    String message, {
    bool isError = true,
  }) {
    final snackBar = SnackBar(
      elevation: 0,
      behavior: SnackBarBehavior.floating,
      backgroundColor: Colors.transparent,
      content: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isError ? const Color(0xFFFEF2F2) : const Color(0xFFECFDF5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isError ? AppColors.error.withOpacity(0.3) : AppColors.statusOnline.withOpacity(0.3),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: isError ? AppColors.error.withOpacity(0.1) : AppColors.statusOnline.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
                color: isError ? AppColors.error : AppColors.statusOnline,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: isError ? const Color(0xFF991B1B) : const Color(0xFF065F46),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
      duration: const Duration(seconds: 4),
    );

    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(snackBar);
  }
}
