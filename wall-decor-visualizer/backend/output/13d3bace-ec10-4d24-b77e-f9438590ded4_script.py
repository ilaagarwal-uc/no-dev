OUTPUT_PATH = '/tmp/13d3bace-ec10-4d24-b77e-f9438590ded4.glb'

import bpy

def create_wall_skeleton():
    # Clear existing objects in the scene to start fresh
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # DIMENSION DATA ANALYSIS:
    # Total Wall Height: 9' (as indicated on the right)
    # Door/Window Opening Height: 8'
    # Gap above opening: 1' (Total 8' + 1' = 9')
    # Door/Window Opening Width: 7' (left section)
    # Remaining Wall Width: 7'6" (7.5') (right section)
    # Total Wall Width: 7' + 7.5' = 14.5'
    
    # Conversion factor from feet to meters (Blender's default unit)
    FT_TO_M = 0.3048
    
    wall_width = 14.5 * FT_TO_M
    wall_height = 9.0 * FT_TO_M
    wall_thickness = 0.5 * FT_TO_M  # Standard assumed wall thickness
    
    opening_width = 7.0 * FT_TO_M
    opening_height = 8.0 * FT_TO_M

    # 1. Create the Main Wall
    # Create a cube and transform it to match wall dimensions
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Set dimensions and position (bottom-left-back corner at 0,0,0)
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter object for Boolean)
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Position the opening at the bottom-left
    # We make the cutter slightly thicker than the wall to ensure a clean boolean operation
    cutter.scale = (opening_width, wall_thickness * 2, opening_height)
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Subtraction
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier to make the geometry permanent
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Cleanup: Remove the cutter object
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.ops.object.delete()

    # 5. Export to GLB
    # use_selection=False ensures the whole scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/13d3bace-ec10-4d24-b77e-f9438590ded4.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()