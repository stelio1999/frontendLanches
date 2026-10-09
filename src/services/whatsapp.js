// src/services/whatsapp.js

export class WhatsAppService {
  // Número do dono da cozinha (com código do país, sem +)
  static KITCHEN_WHATSAPP = '258841234567'; // ← ALTERE AQUI para o número real
  
  // Formatar preço
  static formatPrice(amount) {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }

  // Formatar data
  static formatDate(date) {
    return new Date(date).toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Formatar mensagem do pedido
  static formatOrderMessage(order, payment, client) {
    const paymentMethodLabels = {
      'bank_transfer': '🏦 Transferência Bancária',
      'mobile_transfer': '📱 Transferência Móvel',
      'in_person': '💵 Pagamento Presencial',
    };

    let message = '';
    message += '🔔 *NOVO PEDIDO - Delivery Food*\n\n';
    message += '━━━━━━━━━━━━━━━━━━━━\n\n';
    
    // Dados do Pedido
    message += '📦 *PEDIDO*\n';
    message += `Número: *#${order.order_number}*\n`;
    message += `Data: ${this.formatDate(order.created_at || new Date())}\n`;
    message += `Status: ${order.status}\n\n`;
    
    // Itens
    message += '🍔 *ITENS DO PEDIDO*\n';
    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        message += `${index + 1}. ${item.quantity}x ${item.product_name || item.title}\n`;
        message += `   ${this.formatPrice(item.total_price || (item.price * item.quantity))}\n`;
        if (item.observations) {
          message += `   📝 Obs: ${item.observations}\n`;
        }
      });
    }
    message += '\n';
    
    // Totais
    message += '💰 *RESUMO*\n';
    const subtotal = (order.total_amount || 0) - (order.delivery_fee || 0);
    message += `Subtotal: ${this.formatPrice(subtotal)}\n`;
    if (order.delivery_fee > 0) {
      message += `Taxa Entrega: ${this.formatPrice(order.delivery_fee)}\n`;
    }
    message += `*TOTAL: ${this.formatPrice(order.total_amount)}*\n\n`;
    
    // Tipo de entrega
    message += '🚚 *TIPO DE ENTREGA*\n';
    if (order.is_delivery) {
      message += `📮 Delivery\n`;
      message += `Endereço: ${order.delivery_address || 'Não informado'}\n`;
      if (order.delivery_lat && order.delivery_lng) {
        message += `📍 Mapa: https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}\n`;
      }
    } else {
      message += `🏪 Retirada no Local\n`;
    }
    message += '\n';
    
    // Dados do Cliente
    if (client) {
      message += '👤 *DADOS DO CLIENTE*\n';
      message += `Nome: ${client.name || 'Cliente'}\n`;
      message += `Telefone: ${client.phone || 'Não informado'}\n`;
      if (client.email) {
        message += `Email: ${client.email}\n`;
      }
      message += '\n';
    }
    
    // Dados do Pagamento
    if (payment) {
      message += '💳 *PAGAMENTO*\n';
      message += `Método: ${paymentMethodLabels[payment.method] || payment.method}\n`;
      message += `Status: ${payment.status}\n`;
      
      if (payment.proof) {
        message += `\n📝 *Comprovativo:*\n${payment.proof}\n`;
      }
      
      if (payment.proof_image) {
        message += `\n🖼️ *Imagem do Comprovativo:*\n${payment.proof_image}\n`;
      }
      message += '\n';
    }
    
    // Observações
    if (order.observations) {
      message += '📝 *OBSERVAÇÕES*\n';
      message += `${order.observations}\n\n`;
    }
    
    message += '━━━━━━━━━━━━━━━━━━━━\n';
    message += '✅ Pedido enviado pelo sistema\n';
    message += '🌐 Delivery Food - Moçambique';
    
    return message;
  }

  // Enviar para WhatsApp (abre em nova aba)
  static sendToWhatsApp(order, payment, client) {
    try {
      const message = this.formatOrderMessage(order, payment, client);
      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${this.KITCHEN_WHATSAPP}?text=${encodedMessage}`;
      
      // Abrir em nova aba
      window.open(url, '_blank');
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar para WhatsApp:', error);
      return false;
    }
  }

  // Copiar mensagem para clipboard (fallback)
  static async copyMessageToClipboard(order, payment, client) {
    try {
      const message = this.formatOrderMessage(order, payment, client);
      await navigator.clipboard.writeText(message);
      return true;
    } catch (error) {
      console.error('Erro ao copiar mensagem:', error);
      return false;
    }
  }
}

export default WhatsAppService;