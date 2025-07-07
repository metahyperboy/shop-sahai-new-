import { supabase } from "@/integrations/supabase/client";

export interface VoiceCommandResult {
  success: boolean;
  message: string;
}

export class VoiceCommandService {
  static async processCommand(command: string, language: string): Promise<VoiceCommandResult> {
    const lowerCommand = command.toLowerCase();
    const isEnglish = language === "english";
    
    try {
      // Extract amount from command
      const amountMatch = lowerCommand.match(/(\d+)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
      
      // Income commands
      if (lowerCommand.includes("income") || lowerCommand.includes("വരുമാനം")) {
        return await this.handleIncomeCommand(command, amount, lowerCommand, isEnglish);
      }
      // Expense commands
      else if (lowerCommand.includes("expense") || lowerCommand.includes("ചെലവ്")) {
        return await this.handleExpenseCommand(command, amount, lowerCommand, isEnglish);
      }
      // Purchase commands
      else if (lowerCommand.includes("purchase") || lowerCommand.includes("വാങ്ങൽ")) {
        return await this.handlePurchaseCommand(command, amount, lowerCommand, isEnglish);
      }
      // Borrow commands
      else if (lowerCommand.includes("borrow") || lowerCommand.includes("കടം")) {
        return await this.handleBorrowCommand(command, amount, lowerCommand, isEnglish);
      }
      else {
        return {
          success: true,
          message: isEnglish 
            ? "I can help you add income, expenses, purchases, and borrowing. Try commands like 'Add income 500' or 'Expense 200 for food'."
            : "വരുമാനം, ചെലവുകൾ, വാങ്ങലുകൾ, കടം എന്നിവ ചേർക്കാൻ ഞാൻ സഹായിക്കാം. '500 വരുമാനം ചേർക്കുക' അല്ലെങ്കിൽ 'ഭക്ഷണത്തിന് 200 ചെലവ്' പോലെ പറയുക."
        };
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        success: false,
        message: isEnglish 
          ? "Sorry, there was an error processing your request. Please try again."
          : "ക്ഷമിക്കണം, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യുന്നതിൽ പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക."
      };
    }
  }

  private static async handleIncomeCommand(command: string, amount: number | null, lowerCommand: string, isEnglish: boolean): Promise<VoiceCommandResult> {
    if (amount) {
      const category = lowerCommand.includes("sales") || lowerCommand.includes("വിൽപന") ? (isEnglish ? "Sales" : "വിൽപന") :
                      lowerCommand.includes("service") || lowerCommand.includes("സേവനം") ? (isEnglish ? "Service" : "സേവനം") :
                      lowerCommand.includes("investment") || lowerCommand.includes("നിക്ഷേപം") ? (isEnglish ? "Investment" : "നിക്ഷേപം") :
                      (isEnglish ? "Other" : "മറ്റുള്ളവ");
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: 'income',
          amount: amount,
          category: category,
          description: `Added via voice: ${command}`,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) throw error;
      
      return {
        success: true,
        message: isEnglish 
          ? `Successfully added income of ₹${amount} in ${category} category.`
          : `₹${amount} വരുമാനം ${category} വിഭാഗത്തിൽ വിജയകരമായി ചേർത്തു.`
      };
    } else {
      return {
        success: false,
        message: isEnglish 
          ? "Please specify the amount. Try: 'Add income 500 rupees'"
          : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: '500 രൂപ വരുമാനം ചേർക്കുക'"
      };
    }
  }

  private static async handleExpenseCommand(command: string, amount: number | null, lowerCommand: string, isEnglish: boolean): Promise<VoiceCommandResult> {
    if (amount) {
      const category = lowerCommand.includes("travel") || lowerCommand.includes("യാത്ര") ? (isEnglish ? "Travel" : "യാത്ര") :
                      lowerCommand.includes("food") || lowerCommand.includes("ഭക്ഷണം") ? (isEnglish ? "Food" : "ഭക്ഷണം") :
                      lowerCommand.includes("utilities") || lowerCommand.includes("യൂട്ടിലിറ്റി") ? (isEnglish ? "Utilities" : "യൂട്ടിലിറ്റി") :
                      lowerCommand.includes("supplies") || lowerCommand.includes("സാധനങ്ങൾ") ? (isEnglish ? "Supplies" : "സാധനങ്ങൾ") :
                      (isEnglish ? "Other" : "മറ്റുള്ളവ");
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: 'expense',
          amount: amount,
          category: category,
          description: `Added via voice: ${command}`,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) throw error;
      
      return {
        success: true,
        message: isEnglish 
          ? `Successfully added expense of ₹${amount} in ${category} category.`
          : `₹${amount} ചെലവ് ${category} വിഭാഗത്തിൽ വിജയകരമായി ചേർത്തു.`
      };
    } else {
      return {
        success: false,
        message: isEnglish 
          ? "Please specify the amount. Try: 'Add expense 200 for travel'"
          : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: 'യാത്രയ്ക്ക് 200 ചെലവ് ചേർക്കുക'"
      };
    }
  }

  private static async handlePurchaseCommand(command: string, amount: number | null, lowerCommand: string, isEnglish: boolean): Promise<VoiceCommandResult> {
    if (amount) {
      // Extract supplier name (simple approach - look for "from" keyword)
      const fromMatch = lowerCommand.match(/from\s+(\w+)/i) || lowerCommand.match(/(\w+)\s+from/i);
      const supplierName = fromMatch ? fromMatch[1] : (isEnglish ? "Unknown Supplier" : "അജ്ഞാത വിതരണക്കാരൻ");
      
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          supplier_name: supplierName,
          total_amount: amount,
          amount_paid: 0,
          balance: amount,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) throw error;
      
      return {
        success: true,
        message: isEnglish 
          ? `Successfully recorded purchase of ₹${amount} from ${supplierName}.`
          : `${supplierName} ൽ നിന്ന് ₹${amount} വാങ്ങൽ വിജയകരമായി രേഖപ്പെടുത്തി.`
      };
    } else {
      return {
        success: false,
        message: isEnglish 
          ? "Please specify the amount. Try: 'Purchase 1000 from supplier ABC'"
          : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: 'ABC വിതരണക്കാരനിൽ നിന്ന് 1000 വാങ്ങൽ'"
      };
    }
  }

  private static async handleBorrowCommand(command: string, amount: number | null, lowerCommand: string, isEnglish: boolean): Promise<VoiceCommandResult> {
    if (amount) {
      // Extract person name (simple approach - look for common patterns)
      const nameMatch = lowerCommand.match(/(?:to|from|give|gave)\s+(\w+)/i) || lowerCommand.match(/(\w+)\s+(?:borrowed|gave|give)/i);
      const borrowerName = nameMatch ? nameMatch[1] : (isEnglish ? "Unknown Person" : "അജ്ഞാത വ്യക്തി");
      
      const { data, error } = await supabase
        .from('borrows')
        .insert({
          borrower_name: borrowerName,
          total_given: amount,
          amount_paid: 0,
          balance: amount,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) throw error;
      
      return {
        success: true,
        message: isEnglish 
          ? `Successfully recorded ₹${amount} borrowed by ${borrowerName}.`
          : `${borrowerName} കടം വാങ്ങിയ ₹${amount} വിജയകരമായി രേഖപ്പെടുത്തി.`
      };
    } else {
      return {
        success: false,
        message: isEnglish 
          ? "Please specify the amount. Try: 'John borrowed 500 rupees'"
          : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: 'ജോൺ 500 രൂപ കടം വാങ്ങി'"
      };
    }
  }
}