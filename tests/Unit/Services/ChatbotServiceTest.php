<?php

namespace Tests\Unit\Services;

use App\Services\ChatbotService;
use App\Models\Chatbot;
use App\Models\ChatbotFlow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatbotServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ChatbotService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ChatbotService::class);
    }

    /** @test */
    public function it_can_match_trigger_keyword()
    {
        $chatbot = Chatbot::factory()->create([
            'trigger_type' => 'keyword',
            'trigger_value' => 'oi|olá|hey',
        ]);

        $this->assertTrue($this->service->matchesTrigger($chatbot, 'oi'));
        $this->assertTrue($this->service->matchesTrigger($chatbot, 'Olá'));
        $this->assertTrue($this->service->matchesTrigger($chatbot, 'HEY'));
        $this->assertTrue($this->service->matchesTrigger($chatbot, 'Oi, tudo bem?'));

        $this->assertFalse($this->service->matchesTrigger($chatbot, 'tchau'));
        $this->assertFalse($this->service->matchesTrigger($chatbot, 'Bom dia'));
    }

    /** @test */
    public function it_can_match_always_trigger()
    {
        $chatbot = Chatbot::factory()->create([
            'trigger_type' => 'always',
        ]);

        $this->assertTrue($this->service->matchesTrigger($chatbot, 'qualquer coisa'));
        $this->assertTrue($this->service->matchesTrigger($chatbot, 'outra mensagem'));
    }

    /** @test */
    public function it_processes_node_variables_correctly()
    {
        $message = 'Olá {{name}}, seu pedido {{order_id}} está pronto!';
        $variables = ['name' => 'João', 'order_id' => '12345'];

        $processed = $this->service->processVariables($message, $variables);

        $this->assertEquals('Olá João, seu pedido 12345 está pronto!', $processed);
    }

    /** @test */
    public function it_processes_multiple_same_variables()
    {
        $message = 'Olá {{name}}! Bem-vindo {{name}}!';
        $variables = ['name' => 'Maria'];

        $processed = $this->service->processVariables($message, $variables);

        $this->assertEquals('Olá Maria! Bem-vindo Maria!', $processed);
    }

    /** @test */
    public function it_handles_missing_variables_gracefully()
    {
        $message = 'Olá {{name}}, seu pedido {{order_id}} está pronto!';
        $variables = ['name' => 'João']; // falta order_id

        $processed = $this->service->processVariables($message, $variables);

        $this->assertEquals('Olá João, seu pedido {{order_id}} está pronto!', $processed);
    }

    /** @test */
    public function it_evaluates_simple_condition_correctly()
    {
        $node = [
            'type' => 'condition',
            'conditions' => [
                ['variable' => 'age', 'operator' => '>', 'value' => 18],
            ],
        ];

        $variables = ['age' => 25];
        $this->assertTrue($this->service->evaluateCondition($node, $variables));

        $variables = ['age' => 15];
        $this->assertFalse($this->service->evaluateCondition($node, $variables));

        $variables = ['age' => 18];
        $this->assertFalse($this->service->evaluateCondition($node, $variables));
    }

    /** @test */
    public function it_evaluates_equality_condition()
    {
        $node = [
            'type' => 'condition',
            'conditions' => [
                ['variable' => 'status', 'operator' => '==', 'value' => 'active'],
            ],
        ];

        $this->assertTrue($this->service->evaluateCondition($node, ['status' => 'active']));
        $this->assertFalse($this->service->evaluateCondition($node, ['status' => 'inactive']));
    }

    /** @test */
    public function it_evaluates_multiple_conditions_with_and()
    {
        $node = [
            'type' => 'condition',
            'operator' => 'AND',
            'conditions' => [
                ['variable' => 'age', 'operator' => '>=', 'value' => 18],
                ['variable' => 'status', 'operator' => '==', 'value' => 'active'],
            ],
        ];

        $this->assertTrue($this->service->evaluateCondition($node, [
            'age' => 25,
            'status' => 'active',
        ]));

        $this->assertFalse($this->service->evaluateCondition($node, [
            'age' => 25,
            'status' => 'inactive',
        ]));

        $this->assertFalse($this->service->evaluateCondition($node, [
            'age' => 15,
            'status' => 'active',
        ]));
    }

    /** @test */
    public function it_evaluates_multiple_conditions_with_or()
    {
        $node = [
            'type' => 'condition',
            'operator' => 'OR',
            'conditions' => [
                ['variable' => 'role', 'operator' => '==', 'value' => 'admin'],
                ['variable' => 'role', 'operator' => '==', 'value' => 'supervisor'],
            ],
        ];

        $this->assertTrue($this->service->evaluateCondition($node, ['role' => 'admin']));
        $this->assertTrue($this->service->evaluateCondition($node, ['role' => 'supervisor']));
        $this->assertFalse($this->service->evaluateCondition($node, ['role' => 'user']));
    }

    /** @test */
    public function it_validates_flow_structure()
    {
        $validFlow = [
            'nodes' => [
                ['id' => 'start', 'type' => 'start'],
                ['id' => 'text1', 'type' => 'text', 'data' => ['message' => 'Hello']],
                ['id' => 'end', 'type' => 'end'],
            ],
            'edges' => [
                ['source' => 'start', 'target' => 'text1'],
                ['source' => 'text1', 'target' => 'end'],
            ],
        ];

        $this->assertTrue($this->service->validateFlowStructure($validFlow));
    }

    /** @test */
    public function it_detects_invalid_flow_without_start_node()
    {
        $invalidFlow = [
            'nodes' => [
                ['id' => 'text1', 'type' => 'text', 'data' => ['message' => 'Hello']],
                ['id' => 'end', 'type' => 'end'],
            ],
            'edges' => [
                ['source' => 'text1', 'target' => 'end'],
            ],
        ];

        $this->assertFalse($this->service->validateFlowStructure($invalidFlow));
    }

    /** @test */
    public function it_detects_circular_dependencies_in_flow()
    {
        $circularFlow = [
            'nodes' => [
                ['id' => 'start', 'type' => 'start'],
                ['id' => 'node1', 'type' => 'text'],
                ['id' => 'node2', 'type' => 'text'],
            ],
            'edges' => [
                ['source' => 'start', 'target' => 'node1'],
                ['source' => 'node1', 'target' => 'node2'],
                ['source' => 'node2', 'target' => 'node1'], // circular
            ],
        ];

        $this->assertFalse($this->service->validateFlowStructure($circularFlow));
    }

    /** @test */
    public function it_can_get_next_node_in_flow()
    {
        $flow = [
            'nodes' => [
                ['id' => 'start', 'type' => 'start'],
                ['id' => 'text1', 'type' => 'text'],
                ['id' => 'end', 'type' => 'end'],
            ],
            'edges' => [
                ['source' => 'start', 'target' => 'text1'],
                ['source' => 'text1', 'target' => 'end'],
            ],
        ];

        $nextNode = $this->service->getNextNode($flow, 'start');
        $this->assertEquals('text1', $nextNode);

        $nextNode = $this->service->getNextNode($flow, 'text1');
        $this->assertEquals('end', $nextNode);

        $nextNode = $this->service->getNextNode($flow, 'end');
        $this->assertNull($nextNode);
    }
}
